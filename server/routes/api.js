import express from 'express';
import Stock from '../models/Stock.js';
import Sales from '../models/Sales.js';
import CashBalance from '../models/CashBalance.js';
import AdjustmentLog from '../models/AdjustmentLog.js';

const router = express.Router();

// Add Morning Stock
router.post('/stock/morning', async (req, res) => {
  try {
    const { itemName, unitPrice, morningCount, date } = req.body;
    const stock = new Stock({
      itemName,
      unitPrice,
      morningCount,
      date: new Date(date),
    });
    await stock.save();
    res.status(201).json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update Evening Stock
router.put('/stock/evening/:id', async (req, res) => {
  try {
    const { eveningCount } = req.body;
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      { eveningCount },
      { new: true }
    );
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Record Sale
router.post('/sales', async (req, res) => {
  try {
    const { itemName, quantity, totalAmount, date } = req.body;
    const sale = new Sales({
      itemName,
      quantity,
      totalAmount,
      date: new Date(date),
    });
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add Cash Balance (Morning)
router.post('/cash-balance', async (req, res) => {
  try {
    const { morningBalance, date } = req.body;
    const cashBalance = new CashBalance({
      morningBalance,
      date: new Date(date),
    });
    await cashBalance.save();
    res.status(201).json(cashBalance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update Cash Balance (Evening)
router.put('/cash-balance/:id', async (req, res) => {
  try {
    const { salesAmount, adjustments, eveningBalance } = req.body;
    const cashBalance = await CashBalance.findByIdAndUpdate(
      req.params.id,
      { salesAmount, adjustments, eveningBalance },
      { new: true }
    );
    if (!cashBalance) return res.status(404).json({ message: 'Cash balance not found' });
    res.json(cashBalance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Log Adjustment (Updated to adjust stock)
router.post('/adjustments', async (req, res) => {
  try {
    const { type, itemName, amount, reason, date } = req.body;
    const adjustment = new AdjustmentLog({
      type,
      itemName: type === 'stock' ? itemName : undefined,
      amount,
      reason,
      date: new Date(date),
    });
    await adjustment.save();

    if (type === 'stock') {
      const stock = await Stock.findOne({ itemName, date: new Date(date) });
      if (stock) {
        stock.eveningCount = (stock.eveningCount || stock.morningCount) + amount;
        await stock.save();
      }
    }

    res.status(201).json(adjustment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Get Stock by Date
router.get('/stock', async (req, res) => {
  try {
    const { date } = req.query;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const stocks = await Stock.find({ date: { $gte: start, $lte: end } });
    res.json(stocks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get Sales by Date
router.get('/sales', async (req, res) => {
  try {
    const { date } = req.query;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const sales = await Sales.find({ date: { $gte: start, $lte: end } });
    res.json(sales);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get Cash Balance by Date
router.get('/cash-balance', async (req, res) => {
  try {
    const { date } = req.query;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const cashBalance = await CashBalance.findOne({ date: { $gte: start, $lte: end } });
    res.json(cashBalance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get Adjustments by Date
router.get('/adjustments', async (req, res) => {
  try {
    const { date } = req.query;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const adjustments = await AdjustmentLog.find({ date: { $gte: start, $lte: end } });
    res.json(adjustments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;