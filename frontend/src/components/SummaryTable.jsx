import { useState, useEffect } from 'react';
import axios from 'axios';

function SummaryTable({ selectedDate }) {
  const [stockData, setStockData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [cashBalance, setCashBalance] = useState(null);
  const [adjustments, setAdjustments] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [newMorningCount, setNewMorningCount] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockResponse, salesResponse, cashResponse, adjustmentsResponse] = await Promise.all([
          axios.get(`http://localhost:8070/api/stock?date=${selectedDate}`),
          axios.get(`http://localhost:8070/api/sales?date=${selectedDate}`),
          axios.get(`http://localhost:8070/api/cash-balance?date=${selectedDate}`),
          axios.get(`http://localhost:8070/api/adjustments?date=${selectedDate}`),
        ]);
        setStockData(stockResponse.data);
        setSalesData(salesResponse.data);
        setCashBalance(cashResponse.data || {});
        setAdjustments(adjustmentsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [selectedDate]);

  const totalSalesAmount = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalAdjustments = adjustments.reduce((sum, adj) => sum + (adj.type === 'cash' ? adj.amount : 0), 0);
  const calculatedEveningBalance = (cashBalance?.morningBalance || 0) + totalSalesAmount + totalAdjustments;

  const handleEdit = (item) => {
    setEditItem(item);
    setNewMorningCount(item.morningCount || 0);
  };

  const handleSave = async () => {
    if (editItem) {
      try {
        await axios.post('http://localhost:8070/api/stock/morning', {
          itemName: editItem.itemName,
          unitPrice: editItem.unitPrice,
          morningCount: parseInt(newMorningCount),
          date: selectedDate,
        });
        setEditItem(null);
        setNewMorningCount('');
        // Refresh data
        const [stockResponse] = await Promise.all([
          axios.get(`http://localhost:8070/api/stock?date=${selectedDate}`),
        ]);
        setStockData(stockResponse.data);
        alert('Morning count updated and night sales recorded!');
      } catch (error) {
        alert('Error updating morning count: ' + error.response.data.message);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Daily Summary ({selectedDate})</h2>
      <h3 className="text-lg font-medium mb-2">Stock Summary</h3>
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Item</th>
            <th className="border p-2">Morning Count</th>
            <th className="border p-2">Evening Count</th>
            <th className="border p-2">Units Sold</th>
            <th className="border p-2">Sales Amount ($)</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {stockData.map((stock) => {
            const totalSold = salesData
              .filter(sale => sale.itemName === stock.itemName && new Date(sale.date).toDateString() === new Date(selectedDate).toDateString())
              .reduce((sum, sale) => sum + sale.quantity, 0);
            const eveningCount = stock.eveningCount !== undefined ? stock.eveningCount : stock.morningCount - totalSold;
            const unitsSold = stock.morningCount - eveningCount;
            const salesForItem = salesData
              .filter(s => s.itemName === stock.itemName && new Date(s.date).toDateString() === new Date(selectedDate).toDateString())
              .reduce((sum, s) => sum + s.totalAmount, 0);
            return (
              <tr key={stock._id}>
                <td className="border p-2">{stock.itemName}</td>
                <td className="border p-2">{stock.morningCount}</td>
                <td className="border p-2">{eveningCount >= 0 ? eveningCount : 'N/A'}</td>
                <td className="border p-2">{unitsSold >= 0 ? unitsSold : 'N/A'}</td>
                <td className="border p-2">{salesForItem.toFixed(2)}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(stock)}
                    className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {editItem && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-medium mb-2">Edit Morning Count for {editItem.itemName}</h3>
          <input
            type="number"
            value={newMorningCount}
            onChange={(e) => setNewMorningCount(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
          >
            Save
          </button>
          <button
            onClick={() => setEditItem(null)}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      )}
      <h3 className="text-lg font-medium mb-2">Sales Summary</h3>
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Item</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Total Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((sale) => (
            <tr key={sale._id}>
              <td className="border p-2">{sale.itemName}</td>
              <td className="border p-2">{sale.quantity}</td>
              <td className="border p-2">{sale.totalAmount.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td className="border p-2">Total</td>
            <td className="border p-2">{salesData.reduce((sum, s) => sum + s.quantity, 0)}</td>
            <td className="border p-2">{totalSalesAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <h3 className="text-lg font-medium mb-2">Cash Balance</h3>
      {cashBalance && (
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Morning Balance ($)</th>
              <th className="border p-2">Sales Amount ($)</th>
              <th className="border p-2">Adjustments ($)</th>
              <th className="border p-2">Evening Balance ($)</th>
              <th className="border p-2">Calculated Balance ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{cashBalance.morningBalance?.toFixed(2) ?? '0.00'}</td>
              <td className="border p-2">{totalSalesAmount.toFixed(2)}</td>
              <td className="border p-2">{totalAdjustments.toFixed(2)}</td>
              <td className="border p-2">{cashBalance.eveningBalance?.toFixed(2) ?? 'N/A'}</td>
              <td className="border p-2" style={{ color: calculatedEveningBalance === cashBalance.eveningBalance ? 'green' : 'red' }}>
                {calculatedEveningBalance.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <h3 className="text-lg font-medium mb-2">Adjustments</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Type</th>
            <th className="border p-2">Item</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Reason</th>
          </tr>
        </thead>
        <tbody>
          {adjustments.map((adj) => (
            <tr key={adj._id}>
              <td className="border p-2">{adj.type}</td>
              <td className="border p-2">{adj.itemName ?? 'N/A'}</td>
              <td className="border p-2">{adj.amount}</td>
              <td className="border p-2">{adj.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SummaryTable;