import { Ticket } from '../tickets';

it('implements optimistic concurrency update', async (done) => {
  //create ticket
  const ticket = Ticket.build({
    title: 'sldkjf',
    price: 4,
    userId: '234',
  });

  //save ticket to DB
  await ticket.save();

  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  //make two separate changes to tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 12 });
  //save the first fetched ticket
  await firstInstance!.save();

  //save the second fetched tickt (it should fail)expect error
  try {
    await secondInstance!.save();
  } catch (e) {
    return done();
  }
  throw new Error('should not reach this point');
});

it('incremenets a version number of multpile saves', async () => {
  const ticket = Ticket.build({
    title: ' condne',
    price: 10,
    userId: '1334',
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
});
