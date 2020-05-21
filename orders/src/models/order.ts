import mongoose from 'mongoose';
import { OrderStatus } from '../events/types/order_status';
import { TicketDoc } from './ticket';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}
//the reasons theses two interfaces are iddferrent is bc the
//attributes that are required to create a document might be diffreent than
//the attributes that actually end up saved in a document
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}
//the below is basically adding on a mehthod to the Model object
//build that allows TS to work easily with Mongoose
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    //the reason this is capitalized is bc this is strictly for mongoose to comsume,
    //the above lovercase for attrs is for TS

    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      //ref property will populate the Ticket(other Db) object to this ticket property
      ref: 'Ticket',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
