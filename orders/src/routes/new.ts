import express, { Request, Response } from 'express';
import { requireAuth } from '../middlewares/require_auth';
import { validateRequest } from '../middlewares/validate_request';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { NotFoundError } from '../errors/not_found_error';
import { OrderStatus } from '../events/types/order_status';
import { BadRequestError } from '../errors/bad_request_error';
import { OrderCreatedPublisher } from '../events/order_created_publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
const expirationWindowSeconds = 1 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //find the ticket that the user is tyring to order from the DB
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError('ticket is already taken');
    }
    //calculate an expriation date/time for the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + expirationWindowSeconds);

    // build the order and save it to the DB
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    //Publish an event that an order has been created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      version: order.version,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
