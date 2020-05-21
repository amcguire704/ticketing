import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/users';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '../errors/bad_request_error';
import { validateRequest } from '../middlewares/validate_request';
import { Password } from '../services/password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('email must be valid'),
    body('password').trim().notEmpty().withMessage('must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('login attempt failed');
    }
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError('invalid credentials');
    }
    //Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY! //nadded ! to get TS to shut up bc we check the env on index.ts
    );

    // store on websession object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signInRouter };
