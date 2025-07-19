import { useState } from 'react';
import axios from 'axios';

function AdjustmentForm({ selectedDate, stockItems, onAdjustmentMade }) {
  const [type, setType] = useState('stock');
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const adjustment = {
        type,
        itemName: type === 'stock' ? itemName : undefined,
        amount: parseFloat(amount),
        reason,
        date: selectedDate,
      };
      await axios.post('http://localhost:8070/api/adjustments', adjustment);
      alert('Adjustment logged!');
      setItemName('');
      setAmount('');
      setReason('');
      if (onAdjustmentMade && type === 'cash') {
        onAdjustmentMade(prev => (prev || 0) + parseFloat(amount));
      }
    } catch (error) {
      alert('Error logging adjustment: ' + error.response.data.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Log Adjustment</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="stock">Stock</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        {type === 'stock' && (
          <div className="mb-2">
            <label className="block text-sm font-medium">Item Name</label>
            <select
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select an item</option>
              {stockItems.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-2">
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            step={type === 'stock' ? '1' : '0.01'}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Log Adjustment
        </button>
      </form>
    </div>
  );
}

export default AdjustmentForm;