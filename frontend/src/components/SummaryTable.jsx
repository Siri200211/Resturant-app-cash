import { useState, useEffect } from 'react';
import axios from 'axios';

function SummaryTable({ selectedDate }) {
  const [stockData, setStockData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [cashBalance, setCashBalance] = useState(null);
  const [adjustments, setAdjustments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockResponse = await axios.get(`http://localhost:8070/api/stock?date=${selectedDate}`);
        setStockData(stockResponse.data);
        const salesResponse = await axios.get(`http://localhost:8070/api/sales?date=${selectedDate}`);
        setSalesData(salesResponse.data);
        const cashResponse = await axios.get(`http://localhost:8070/api/cash-balance?date=${selectedDate}`);
        setCashBalance(cashResponse.data);
        const adjustmentsResponse = await axios.get(`http://localhost:8070/api/adjustments?date=${selectedDate}`);
        setAdjustments(adjustmentsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [selectedDate]);

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
          </tr>
        </thead>
        <tbody>
          {stockData.map((stock) => (
            <tr key={stock._id}>
              <td className="border p-2">{stock.itemName}</td>
              <td className="border p-2">{stock.morningCount}</td>
              <td className="border p-2">{stock.eveningCount ?? 'N/A'}</td>
              <td className="border p-2">{stock.eveningCount ? stock.morningCount - stock.eveningCount : 'N/A'}</td>
              <td className="border p-2">
                {stock.eveningCount ? ((stock.morningCount - stock.eveningCount) * stock.unitPrice).toFixed(2) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{cashBalance.morningBalance.toFixed(2)}</td>
              <td className="border p-2">{cashBalance.salesAmount.toFixed(2)}</td>
              <td className="border p-2">{cashBalance.adjustments.toFixed(2)}</td>
              <td className="border p-2">{cashBalance.eveningBalance?.toFixed(2) ?? 'N/A'}</td>
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