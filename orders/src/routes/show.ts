import express, { Request, Response } from 'express';
import { requireAuth } from '../middlewares/require_auth';
import { Order } from '../models/order';
import mongoose from 'mongoose';
import { NotFoundError } from '../errors/not_found_error';
import { NotAuthorizedError } from '../errors/not_authorized';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    const huh = mongoose.Types.ObjectId.isValid(req.params.orderId);
    console.log(huh);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
