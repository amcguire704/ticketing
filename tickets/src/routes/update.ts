import express, { Request, Response } from 'express';
import { app } from '../app';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate_request';
import { NotFoundError } from '../errors/not_found_error';
import { requireAuth } from '../middlewares/require_auth';
import { NotAuthorizedError } from '../errors/not_authorized';
import { Ticket } from '../models/tickets';
import { TicketUpdatedPublisher } from '../events/ticket_updated_publisher';
import { natsWrapper } from '../nats-wrapper';
import { BadRequestError } from '../errors/bad_request_error';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than zero'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //first wnt to pass the first two tests
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }
    if (ticket.orderId) {
      throw new BadRequestError('this ticket is reserved, cannot edit');
    }
    console.log(ticket.userId);
    console.log(req.currentUser!.id);
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      version: ticket.version,
      price: ticket.price,
      userId: ticket.userId,
    });

    //.set is the set command that changes the value or put request
    res.send(ticket);
  }
);

export { router as updateTicketRouter };
