import express, { Response, Request } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middlewares/require_auth';
import { validateRequest } from '../middlewares/validate_request';
import { BadRequestError } from '../errors/bad_request_error';
import { NotFoundError } from '../errors/not_found_error';
import { Order } from '../models/order';
import { NotAuthorizedError } from '../errors/not_authorized';
import { OrderStatus } from '../events/types/order_status';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/payment_created_publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,

  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Canceled) {
      throw new BadRequestError('cannot pay for expired order');
    }
    //create a stripe charge

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
