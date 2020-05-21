import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
// must provide 'as Buffer" below because ts doenst know about what type of
//value buf is
export class Password {
  //static methods are differnrt that we dont have to make a new instance of Class before
  // before you call methods on the class.
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }
  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return buf.toString('hex') === hashedPassword; ///will return ture or false
  }
}
