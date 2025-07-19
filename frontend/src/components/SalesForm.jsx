import { useState } from 'react';
import axios from 'axios';

function SalesForm({ selectedDate, stockItems, onSaleRecorded }) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sale = {
        itemName,
        quantity: parseInt(quantity),
        totalAmount: parseFloat(totalAmount),
        date: selectedDate,
      };
      await axios.post('http://localhost:8070/api/sales', sale);
      alert('Sale recorded!');
      setItemName('');
      setQuantity('');
      setTotalAmount('');
      if (onSaleRecorded) onSaleRecorded(prev => (prev || 0) + parseFloat(totalAmount));
    } catch (error) {
      alert('Error recording sale: ' + error.response.data.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Record Sale</h2>
      <form onSubmit={handleSubmit}>
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
        <div className="mb-2">
          <label className="block text-sm font-medium">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Total Amount ($)</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full p-2 border rounded"
            step="0.01"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Record Sale
        </button>
      </form>
    </div>
  );
}

export default SalesForm;