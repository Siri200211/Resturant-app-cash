import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  morningCount: {
    type: Number,
    required: true,
    min: 0,
  },
  eveningCount: {
    type: Number,
    min: 0,
    default: null,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default mongoose.model('Stock', stockSchema);