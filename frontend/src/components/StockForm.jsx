import { useState } from 'react';
import axios from 'axios';

function StockForm({ selectedDate, onStockAdded }) {
  const [itemName, setItemName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [morningCount, setMorningCount] = useState('');
  const [eveningCount, setEveningCount] = useState('');
  const [stockId, setStockId] = useState('');

  const handleMorningSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8070/api/stock/morning', {
        itemName,
        unitPrice: parseFloat(unitPrice),
        morningCount: parseInt(morningCount),
        date: selectedDate,
      });
      setStockId(response.data._id);
      alert('Morning stock added!');
      setItemName('');
      setUnitPrice('');
      setMorningCount('');
      if (onStockAdded) onStockAdded(prev => [...prev, itemName]);
    } catch (error) {
      alert('Error adding morning stock: ' + error.response.data.message);
    }
  };

  const handleEveningSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8070/api/stock/evening/${stockId}`, {
        eveningCount: parseInt(eveningCount),
      });
      alert('Evening stock updated!');
      setEveningCount('');
      setStockId('');
    } catch (error) {
      alert('Error updating evening stock: ' + error.response.data.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Manage Stock</h2>
      <form onSubmit={handleMorningSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Unit Price ($)</label>
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className="w-full p-2 border rounded"
            step="0.01"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Morning Count</label>
          <input
            type="number"
            value={morningCount}
            onChange={(e) => setMorningCount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Morning Stock
        </button>
      </form>
      <form onSubmit={handleEveningSubmit}>
        <div className="mb-2">
          <label className="block text-sm font-medium">Evening Count</label>
          <input
            type="number"
            value={eveningCount}
            onChange={(e) => setEveningCount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Update Evening Stock
        </button>
      </form>
    </div>
  );
}

export default StockForm;