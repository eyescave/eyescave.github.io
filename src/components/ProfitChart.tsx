import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jun', income: 200, expense: 100 },
  { name: 'Jul', income: 300, expense: 150 },
  { name: 'Aug', income: 250, expense: 120 },
  { name: 'Sep', income: 400, expense: 200 },
  { name: 'Oct', income: 628, expense: 300 },
  { name: 'Nov', income: 500, expense: 250 },
  { name: 'Dec', income: 450, expense: 220 },
];

export function ProfitChart() {
  return (
    <div className="chart-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Total profit</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D3E4FD]" />
            <span className="text-sm text-gray-600">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200" />
            <span className="text-sm text-gray-600">Expense</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#D3E4FD" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="#E2E8F0" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}