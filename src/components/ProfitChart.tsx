import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const weekData = [
  { name: 'Mon', completed: 5 },
  { name: 'Tue', completed: 8 },
  { name: 'Wed', completed: 6 },
  { name: 'Thu', completed: 12 },
  { name: 'Fri', completed: 9 },
  { name: 'Sat', completed: 4 },
  { name: 'Sun', completed: 7 },
];

const monthData = [
  { name: 'Week 1', completed: 25 },
  { name: 'Week 2', completed: 30 },
  { name: 'Week 3', completed: 28 },
  { name: 'Week 4', completed: 35 },
];

const yearData = [
  { name: 'Jan', completed: 100 },
  { name: 'Feb', completed: 120 },
  { name: 'Mar', completed: 90 },
  { name: 'Apr', completed: 150 },
  { name: 'May', completed: 130 },
  { name: 'Jun', completed: 140 },
  { name: 'Jul', completed: 160 },
  { name: 'Aug', completed: 145 },
  { name: 'Sep', completed: 170 },
  { name: 'Oct', completed: 155 },
  { name: 'Nov', completed: 180 },
  { name: 'Dec', completed: 165 },
];

export function ProfitChart() {
  const [timeFrame, setTimeFrame] = useState('week');

  const getDataByTimeFrame = () => {
    switch (timeFrame) {
      case 'week':
        return weekData;
      case 'month':
        return monthData;
      case 'year':
        return yearData;
      default:
        return weekData;
    }
  };

  const getTotalTasks = () => {
    return getDataByTimeFrame().reduce((sum, item) => sum + item.completed, 0);
  };

  return (
    <div className="chart-container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Total Tasks Completed</h2>
          <p className="text-gray-600 mt-1">Total: {getTotalTasks()}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          className={`px-6 py-2 rounded-full text-sm ${timeFrame === 'week' ? 'bg-blue-50' : 'text-gray-500'}`}
          onClick={() => setTimeFrame('week')}
        >
          Week
        </button>
        <button 
          className={`px-6 py-2 rounded-full text-sm ${timeFrame === 'month' ? 'bg-blue-50' : 'text-gray-500'}`}
          onClick={() => setTimeFrame('month')}
        >
          Month
        </button>
        <button 
          className={`px-6 py-2 rounded-full text-sm ${timeFrame === 'year' ? 'bg-blue-50' : 'text-gray-500'}`}
          onClick={() => setTimeFrame('year')}
        >
          Year
        </button>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getDataByTimeFrame()}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#D3E4FD" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}