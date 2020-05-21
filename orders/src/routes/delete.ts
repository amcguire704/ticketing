import express, { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/order';
import { requireAuth } from '../middlewares/require_auth';
import { NotFoundError } from '../errors/not_found_error';
import { NotAuthorizedError } from '../errors/not_authorized';
import { OrderCanceledPublisher } from '../events/order_canceled_publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    //authenticate the user
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('ticket');
    //this makes sure as I make the query on the database it will
    //populate the ticket property so that i can reference ticket.id below on
    //the orderCanceledPublisher
    //fetch the order
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Canceled;
    await order.save();
    //need to publish an event letting other services know the order was canceled
    new OrderCanceledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
