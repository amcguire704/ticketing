import express, { Request, Response } from 'express';
import { requireAuth } from '../middlewares/require_auth';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');
  //.populate will show the ticket associated with each order

  res.send(orders);
});

export { router as indexOrderRouter };
