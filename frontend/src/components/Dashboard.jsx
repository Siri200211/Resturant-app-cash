import { useState, useEffect } from 'react';
import StockForm from './StockForm';
import SalesForm from './SalesForm';
import CashBalanceForm from './CashBalanceForm';
import AdjustmentForm from './AdjustmentForm';
import SummaryTable from './SummaryTable';

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [cashBalance, setCashBalance] = useState(null);
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    const fetchCashBalance = async () => {
      try {
        const response = await fetch(`http://localhost:8070/api/cash-balance?date=${selectedDate}`);
        const data = await response.json();
        setCashBalance(data?.eveningBalance || data?.morningBalance || 0);
      } catch (error) {
        console.error('Error fetching cash balance:', error);
      }
    };
    const fetchStockItems = async () => {
      try {
        const response = await fetch(`http://localhost:8070/api/stock?date=${selectedDate}`);
        const data = await response.json();
        setStockItems(data.map(item => item.itemName));
      } catch (error) {
        console.error('Error fetching stock items:', error);
      }
    };
    fetchCashBalance();
    fetchStockItems();
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Restaurant Management Dashboard</h1>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <label className="block text-lg font-medium mb-2">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <div className="text-xl font-semibold">
            Cash Balance: ${cashBalance?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StockForm selectedDate={selectedDate} onStockAdded={setStockItems} />
          <SalesForm selectedDate={selectedDate} stockItems={stockItems} onSaleRecorded={setCashBalance} />
          <CashBalanceForm selectedDate={selectedDate} initialBalance={cashBalance} onBalanceUpdated={setCashBalance} />
          <AdjustmentForm selectedDate={selectedDate} stockItems={stockItems} onAdjustmentMade={setCashBalance} />
        </div>
        <SummaryTable selectedDate={selectedDate} />
      </div>
    </div>
  );
}

export default Dashboard;