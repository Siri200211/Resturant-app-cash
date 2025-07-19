import mongoose from 'mongoose';

const adjustmentLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['stock', 'cash'],
  },
  itemName: {
    type: String,
    trim: true,
    required: function() { return this.type === 'stock'; },
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default mongoose.model('AdjustmentLog', adjustmentLogSchema);