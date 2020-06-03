//subject is the name of a channel
export enum Subjects {
  TicketCreated = 'ticket:created',
  OrderUpdated = 'order:updated',
  TicketUpdated = 'ticket:updated',
  OrderCreated = 'order:created',
  OrderCanceled = 'order:canceled',
  PaymentCreated = 'payment:created',
  ExpirationComplete = 'expiration:complete',
}
