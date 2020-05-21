import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  req.session = null;
  //still need to do res.send
  res.send({});
});

export { router as signOutRouter };
