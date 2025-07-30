import { useState, useEffect } from 'react';
import axios from 'axios';

function CashBalanceForm({ selectedDate, initialBalance, onBalanceUpdated }) {
  const [morningBalance, setMorningBalance] = useState(initialBalance || '');
  const [salesAmount, setSalesAmount] = useState(0);
  const [adjustments, setAdjustments] = useState(0);
  const [cashBalanceId, setCashBalanceId] = useState('');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get(`http://localhost:8070/api/sales?date=${selectedDate}`);
        const totalSales = response.data.reduce((sum, sale) => sum + sale.totalAmount, 0);
        setSalesAmount(totalSales);
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    };
    const fetchAdjustments = async () => {
      try {
        const response = await axios.get(`http://localhost:8070/api/adjustments?date=${selectedDate}`);
        const totalAdjustments = response.data.reduce((sum, adj) => sum + (adj.type === 'cash' ? adj.amount : 0), 0);
        setAdjustments(totalAdjustments);
      } catch (error) {
        console.error('Error fetching adjustments:', error);
      }
    };
    fetchSales();
    fetchAdjustments();
  }, [selectedDate]);

  const handleMorningSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8070/api/cash-balance', {
        morningBalance: parseFloat(morningBalance),
        date: selectedDate,
      });
      setCashBalanceId(response.data._id);
      alert('Morning cash balance added!');
      setMorningBalance('');
      if (onBalanceUpdated) onBalanceUpdated(parseFloat(morningBalance));
    } catch (error) {
      alert('Error adding morning balance: ' + error.response.data.message);
    }
  };

  const handleEveningSubmit = async (e) => {
    e.preventDefault();
    try {
      const eveningBalance = (parseFloat(morningBalance) || 0) + salesAmount + adjustments;
      await axios.put(`http://localhost:8070/api/cash-balance/${cashBalanceId}`, {
        salesAmount,
        adjustments,
        eveningBalance,
      });
      alert('Evening cash balance updated!');
      if (onBalanceUpdated) onBalanceUpdated(eveningBalance);
    } catch (error) {
      alert('Error updating evening balance: ' + error.response.data.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Manage Cash Balance</h2>
      <form onSubmit={handleMorningSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium">Morning Balance ($)</label>
          <input
            type="number"
            value={morningBalance}
            onChange={(e) => setMorningBalance(e.target.value)}
            className="w-full p-2 border rounded"
            step="0.01"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Morning Balance
        </button>
      </form>
      <form onSubmit={handleEveningSubmit}>
        <div className="mb-2">
          <label className="block text-sm font-medium">Sales Amount ($)</label>
          <input
            type="number"
            value={salesAmount}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
            step="0.01"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Adjustments ($)</label>
          <input
            type="number"
            value={adjustments}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={!cashBalanceId}
        >
          Update Evening Balance
        </button>
      </form>
    </div>
  );
}

export default CashBalanceForm;