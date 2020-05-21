import mongoose from 'mongoose';
import { buildCheckFunction } from 'express-validator';
import { Password } from '../services/password';
//an interface that describes the props that are requireed to ceraete user

interface userAttrs {
  email: string;
  password: string;
}
//interface that describes the props that user model/collection has
interface userModel extends mongoose.Model<userDoc> {
  build(attrs: userAttrs): userDoc;
}
//interace that describes props that user document has

interface userDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String, //this is for mongoose thats why it is capitalized
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      ///this is basically json.stringify but it overrides that
      //it will transform the return of stringify by deleting the password key
      //and not show it to the user and version key
      transform(doc, ret) {
        delete ret.password;
      },
      versionKey: false,
    },
  }
);
// must call done when at the end of function bc mongoose doesnt handle
//async await very well
//pre is a middleware funtion in mongoose
// use the function keyword bc instead of arrow fnc we get access to this

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    // can use Password with . bc the method is static
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});
userSchema.statics.build = (attrs: userAttrs) => {
  return new User(attrs);
};

//define the new Model using userShema
const User = mongoose.model<userDoc, userModel>('User', userSchema);
// angle brackets are called generics it provides a type for function arguemtns
//this is custom function to create new user neeed this for interface with TS
const buildUser = (attrs: userAttrs) => {
  //now it calls the new Contrusctor jsut as pr normal in Mongoose
  return new User(attrs);
};

export { User, buildUser };
//instead of having to do the above, its best to have one thing to export so below is the
//refactored approach
