import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import Navbar from '../../../generic_comp/navbar';

const COLORS = [
  '#4169E1', // Royal Blue
  '#FF6B6B', // Coral Red
  '#4CAF50', // Green
  '#FFA726', // Orange
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

interface TicketCount {
  name: string;
  value: number;
}

const DashboardWithChat = () => {
  const [pieData, setPieData] = useState<TicketCount[]>([]);
  const [statusData, setStatusData] = useState<TicketCount[]>([]);
  const [categoryData, setCategoryData] = useState<TicketCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pieResponse, statusResponse, categoryResponse] =
          await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cake`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cake/status`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cake/category`),
          ]);

        const pieResult = await pieResponse.json();
        const statusResult = await statusResponse.json();
        const categoryResult = await categoryResponse.json();

        // Filter for selected agents
        const selectedAgents = [
          'Jacob',
          'Helpforklift',
          'Sebastian',
          'Andres',
          'Felipe',
          'Santiago Lop',
          'Reynel',
          'Richard B',
        ];
        const filteredPieData = pieResult.filter((item: TicketCount) =>
          selectedAgents.includes(item.name)
        );

        setPieData(filteredPieData);
        setStatusData(statusResult);
        setCategoryData(categoryResult);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePercentage = (value: number) => {
    const total = statusData.reduce((acc, curr) => acc + curr.value, 0);
    return ((value / total) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className='p-6 px-64 bg-gray-50'>
        {/* 1. Pie Chart - Agents Distribution */}
        <h1 className='text-2xl font-bold mb-6'>
          Support Ticket Distribution
        </h1>
        <div className='w-full h-96 bg-white rounded-lg shadow-lg p-4 mb-8'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={pieData}
                cx='50%'
                cy='50%'
                labelLine={true}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
                outerRadius={120}
                fill='#8884d8'
                dataKey='value'
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} tickets`]}
              />
              <Legend
                layout='vertical'
                align='right'
                verticalAlign='middle'
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Status Table */}
        <h2 className='text-2xl font-bold mb-6'>
          Ticket Status Distribution
        </h2>
        <div className='bg-white rounded-lg shadow-lg overflow-hidden mb-8'>
          <table className='min-w-full'>
            <thead>
              <tr className='bg-gray-600 text-white'>
                <th className='px-6 py-3 text-left text-sm font-semibold uppercase'>
                  STATUS
                </th>
                <th className='px-6 py-3 text-right text-sm font-semibold uppercase'>
                  %
                </th>
                <th className='px-6 py-3 text-right text-sm font-semibold uppercase'>
                  # Tickets
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {statusData.map((status, index) => {
                const percentage = calculatePercentage(status.value);
                let bgColor;

                switch (status.name.toLowerCase()) {
                  case 'done':
                    bgColor = 'bg-green-100';
                    break;
                  case 'scaled':
                    bgColor = 'bg-blue-100';
                    break;
                  case 'in progress':
                    bgColor = 'bg-red-100';
                    break;
                  default:
                    bgColor = 'bg-gray-50';
                }

                return (
                  <tr key={status.name} className={bgColor}>
                    <td className='px-6 py-4 text-sm text-gray-900'>
                      {status.name}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900 text-right'>
                      {percentage}%
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900 text-right'>
                      {status.value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3. Category Chart */}
        {/* 3. Category Chart */}
        <h2 className='text-2xl font-bold mb-6'>
          Distribution by Category
        </h2>
        <div className='w-full h-[600px] bg-white rounded-lg shadow-lg p-4'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={categoryData.map((item) => {
                const total = categoryData.reduce(
                  (acc, curr) => acc + curr.value,
                  0
                );
                return {
                  ...item,
                  percentage: (item.value / total) * 100,
                };
              })}
              layout='vertical'
              margin={{ top: 5, right: 30, left: 220, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' horizontal={false} />
              <XAxis
                type='number'
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <YAxis
                type='category'
                dataKey='name'
                width={200}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'percentage') {
                    return [`${value.toFixed(2)}%`, 'Percentage'];
                  }
                  return [value, name];
                }}
              />
              <Bar
                dataKey='percentage'
                fill='#4169E1'
                barSize={20}
                label={(props) => {
                  const { value, x, y, width } = props;
                  return (
                    <text
                      x={x + width + 10}
                      y={y}
                      fill='#666'
                      dominantBaseline='middle'
                    >
                      {`${value.toFixed(2)}%`}
                    </text>
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default DashboardWithChat;
