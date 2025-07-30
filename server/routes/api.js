import express from 'express';
import Stock from '../models/Stock.js';
import Sales from '../models/Sales.js';
import CashBalance from '../models/CashBalance.js';
import AdjustmentLog from '../models/AdjustmentLog.js';

const router = express.Router();

// Add or Update Morning Stock with Night Sale Adjustment
router.post('/stock/morning', async (req, res) => {
  try {
    const { itemName, unitPrice, morningCount, date } = req.body;
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    // Find the latest stock record for the item
    let stock = await Stock.findOne({ itemName, date: currentDate });
    if (!stock) {
      // Create a new stock record if none exists for the date
      stock = new Stock({ itemName, unitPrice, date: currentDate });
      // Get previous day's evening count
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevStock = await Stock.findOne({ itemName, date: prevDate });
      const prevEveningCount = prevStock?.eveningCount !== undefined ? prevStock.eveningCount : 0;
      stock.morningCount = prevEveningCount || 0;
    }

    // Calculate night sale difference (if editing)
    const originalMorningCount = stock.morningCount;
    const newMorningCount = parseInt(morningCount) || 0;
    stock.morningCount = newMorningCount;
    await stock.save();

    // If there’s a difference, record it as a night sale for the previous day
    if (originalMorningCount !== newMorningCount && originalMorningCount > 0) {
      const nightSaleQuantity = originalMorningCount - newMorningCount;
      if (nightSaleQuantity > 0) {
        const totalAmount = stock.unitPrice * nightSaleQuantity;
        const nightSale = new Sales({
          itemName,
          quantity: nightSaleQuantity,
          totalAmount,
          date: prevDate,
          isNightSale: true, // Optional flag to distinguish night sales
        });
        await nightSale.save();

        // Update previous day's cash balance
        let prevCashBalance = await CashBalance.findOne({ date: prevDate }) || new CashBalance({ date: prevDate });
        prevCashBalance.salesAmount = (prevCashBalance.salesAmount || 0) + totalAmount;
        prevCashBalance.eveningBalance = (prevCashBalance.morningBalance || 0) + prevCashBalance.salesAmount + (prevCashBalance.adjustments || 0);
        await prevCashBalance.save();
      }
    }

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
      { eveningCount: parseInt(eveningCount) },
      { new: true }
    );
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Record Sale (Update stock and cash balance)
router.post('/sales', async (req, res) => {
  try {
    const { itemName, quantity, date } = req.body;
    const saleDate = new Date(date);
    saleDate.setHours(0, 0, 0, 0);

    // Find or create stock for the sale date
    let stock = await Stock.findOne({ itemName, date: saleDate });
    if (!stock) {
      const prevStock = await Stock.findOne({ itemName }).sort({ date: -1 });
      if (!prevStock) return res.status(400).json({ message: 'Item not found' });
      stock = new Stock({
        itemName: prevStock.itemName,
        unitPrice: prevStock.unitPrice,
        morningCount: prevStock.eveningCount !== undefined ? prevStock.eveningCount : prevStock.morningCount,
        date: saleDate,
      });
      await stock.save();
    }

    const totalAmount = stock.unitPrice * parseInt(quantity);
    
    // Update stock eveningCount
    stock.eveningCount = (stock.eveningCount || stock.morningCount) - parseInt(quantity);
    if (stock.eveningCount < 0) return res.status(400).json({ message: 'Insufficient stock' });
    await stock.save();

    const sale = new Sales({
      itemName,
      quantity: parseInt(quantity),
      totalAmount,
      date: saleDate,
    });
    await sale.save();

    // Update cash balance for the day
    let cashBalance = await CashBalance.findOne({ date: saleDate }) || new CashBalance({ date: saleDate });
    cashBalance.salesAmount = (cashBalance.salesAmount || 0) + totalAmount;
    cashBalance.eveningBalance = (cashBalance.morningBalance || 0) + cashBalance.salesAmount + (cashBalance.adjustments || 0);
    await cashBalance.save();

    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// [Existing endpoints remain the same]
router.post('/cash-balance', async (req, res) => {
  try {
    const { morningBalance, date } = req.body;
    let cashBalance = await CashBalance.findOne({ date: new Date(date) });
    if (!cashBalance) {
      cashBalance = new CashBalance({ date: new Date(date) });
    }
    cashBalance.morningBalance = parseFloat(morningBalance);
    cashBalance.eveningBalance = parseFloat(morningBalance) + (cashBalance.salesAmount || 0) + (cashBalance.adjustments || 0);
    await cashBalance.save();
    res.status(201).json(cashBalance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/cash-balance/:id', async (req, res) => {
  try {
    const { salesAmount, adjustments, eveningBalance } = req.body;
    const cashBalance = await CashBalance.findById(req.params.id);
    if (!cashBalance) return res.status(404).json({ message: 'Cash balance not found' });

    cashBalance.salesAmount = parseFloat(salesAmount) || cashBalance.salesAmount || 0;
    cashBalance.adjustments = parseFloat(adjustments) || cashBalance.adjustments || 0;
    const calculatedEveningBalance = (cashBalance.morningBalance || 0) + cashBalance.salesAmount + cashBalance.adjustments;
    if (eveningBalance && Math.abs(calculatedEveningBalance - parseFloat(eveningBalance)) > 0.01) {
      return res.status(400).json({ message: 'Evening balance does not match calculated total' });
    }

    cashBalance.eveningBalance = calculatedEveningBalance;
    await cashBalance.save();
    res.json(cashBalance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/adjustments', async (req, res) => {
  try {
    const { type, itemName, amount, reason, date } = req.body;
    const adjustment = new AdjustmentLog({
      type,
      itemName: type === 'stock' ? itemName : undefined,
      amount: parseFloat(amount),
      reason,
      date: new Date(date),
    });
    await adjustment.save();

    if (type === 'stock') {
      const stock = await Stock.findOne({ itemName, date: new Date(date) }) || await Stock.findOne({ itemName }).sort({ date: -1 });
      if (stock) {
        stock.eveningCount = (stock.eveningCount || stock.morningCount) + amount;
        await stock.save();
      }
    } else if (type === 'cash') {
      const cashBalance = await CashBalance.findOne({ date: new Date(date) }) || new CashBalance({ date: new Date(date) });
      cashBalance.adjustments = (cashBalance.adjustments || 0) + amount;
      cashBalance.eveningBalance = (cashBalance.morningBalance || 0) + (cashBalance.salesAmount || 0) + cashBalance.adjustments;
      await cashBalance.save();
    }

    res.status(201).json(adjustment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/stock', async (req, res) => {
  try {
    const { date } = req.query;
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const stocks = await Stock.find({ date: { $gte: selectedDate, $lte: endDate } });
      if (stocks.length === 0) {
        const allStocks = await Stock.find().sort({ date: -1 });
        const result = allStocks.map(stock => ({
          ...stock.toObject(),
          date: selectedDate,
          morningCount: stock.eveningCount !== undefined ? stock.eveningCount : stock.morningCount,
          eveningCount: undefined,
        }));
        res.json(result);
      } else {
        res.json(stocks);
      }
    } else {
      res.json(await Stock.find());
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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

router.get('/cash-balance', async (req, res) => {
  try {
    const { date } = req.query;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const cashBalance = await CashBalance.findOne({ date: { $gte: start, $lte: end } });
    res.json(cashBalance || {});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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