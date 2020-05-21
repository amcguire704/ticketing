import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middlewares/require_auth';
import { validateRequest } from '../middlewares/validate_request';
import { Ticket } from '../models/tickets';
import { TicketCreatedPublisher } from '../events/ticket_created_publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('title is required'),
    //if this fails it will send an error on the incoming request it will not throw
    //an error
    //its up to me to expect the request and see whats going on
    //hence the validateRequest
    body('price')
      .isFloat({ gt: 0 }) //a number with decimal gt is greater than zero
      .withMessage('price must be greter than zero'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
