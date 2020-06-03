import { Publisher } from './basepublisher';
import { ExpirationCompleteEvent } from './expiration_complete_event';
import { Subjects } from './subjects';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
