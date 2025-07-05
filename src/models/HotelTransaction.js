const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId
  },
  search: {
    type: Object
  },
  booking_policy: {
    type: Object
  },
  transaction_identifier: {
    type: String
  },
  contactDetail: {
    type: Object
  },
  hotel: {
    type: Object
  },
  coupon: {
    type: Object
  },
  hotelPackage: {
    type: Object
  },
  status: {
    type: Object
  },
  pricing: {
    base_amount: Number,
    service_component: Number,
    gst: Number,
    total_chargeable_amount: Number,
    actual_room_rate: Number,
    client_commission: Number,
    base_amount_markup_excluded: Number,
    markup_applied: Number,
    currency: String
  },
  prebook_response: {
    type: Object
  },
  payment_response: {
    type: Object
  },
  book_response: {
    type: Object
  },
  cancel_response: {
    type: Object
  },
  refund_response: {
    type: Object
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model('HotelTransaction', TransactionSchema, 'hotelTransactions');