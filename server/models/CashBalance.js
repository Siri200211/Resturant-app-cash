import mongoose from 'mongoose';

const cashBalanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  morningBalance: {
    type: Number,
    required: true,
    min: 0,
  },
  salesAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  adjustments: {
    type: Number,
    default: 0,
  },
  eveningBalance: {
    type: Number,
    default: null,
    min: 0,
  },
});

export default mongoose.model('CashBalance', cashBalanceSchema);