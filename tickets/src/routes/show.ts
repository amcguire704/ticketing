import express, { Request, Response } from 'express';
import { Ticket } from '../models/tickets';
import { NotFoundError } from '../errors/not_found_error';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError();
  }

  //when leave off status code it will default to 200
  res.send(ticket);
});

export { router as showTicketRouter };
