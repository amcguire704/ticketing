import express from 'express';

import { currentUser } from '../middlewares/current_user';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  // //equivalent to (!req.session || !req.session.jwt)
  // if (!req.session?.jwt) {
  //   return res.send({ currentuser: null });
  // }
  // //have to wrap below with a try catch bc .verfify will return an error
  // try {
  //   const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
  //   res.send({ currentuser: payload });
  // } catch (e) {
  //   res.send({ currentuser: null });
  // }

  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
