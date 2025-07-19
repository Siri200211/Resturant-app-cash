import { useState } from 'react';
import axios from 'axios';

function CashBalanceForm({ selectedDate }) {
  const [morningBalance, setMorningBalance] = useState('');
  const [salesAmount, setSalesAmount] = useState('');
  const [adjustments, setAdjustments] = useState('');
  const [cashBalanceId, setCashBalanceId] = useState('');

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
    } catch (error) {
      alert('Error adding morning balance: ' + error.response.data.message);
    }
  };

  const handleEveningSubmit = async (e) => {
    e.preventDefault();
    try {
      const eveningBalance = parseFloat(morningBalance || 0) + parseFloat(salesAmount || 0) + parseFloat(adjustments || 0);
      await axios.put(`http://localhost:8070/api/cash-balance/${cashBalanceId}`, {
        salesAmount: parseFloat(salesAmount),
        adjustments: parseFloat(adjustments),
        eveningBalance,
      });
      alert('Evening cash balance updated!');
      setSalesAmount('');
      setAdjustments('');
      setCashBalanceId('');
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
            onChange={(e) => setSalesAmount(e.target.value)}
            className="w-full p-2 border rounded"
            step="0.01"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Adjustments ($)</label>
          <input
            type="number"
            value={adjustments}
            onChange={(e) => setAdjustments(e.target.value)}
            className="w-full p-2 border rounded"
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