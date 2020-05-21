export enum OrderStatus {
  //when the order is created byt the ticket is the ticket has not been reserved
  Created = 'created',
  //the ticket the order is trying to reserve has already been reserved or when
  // when the user has cancelled the order
  //or the order expiress before the payment is made
  Canceled = 'canceled',
  //the order has successfully reserved the ticket
  AwaitingPayment = 'awaiting:payment',

  //the order has reserved the ticketed and the user has provided payment
  Complete = 'complete',
}
