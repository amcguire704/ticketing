import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middlewares/validate_request';

import { User } from '../models/users';

import { BadRequestError } from '../errors/bad_request_error';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('password must be within 4 -20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    //returns a promise with either the user data or null
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('email in use');
    }

    const user = User.build({ email, password });
    await user.save();

    //Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY! //nadded ! to get TS to shut up bc we check the env on index.ts
    );

    // store on websession object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
