import { Card, Typography } from '@material-tailwind/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useGetDashboardQuery } from '../api/Userapi';

const Dashboard = () => {
  const { data: dashboardData, isLoading, isError } = useGetDashboardQuery();

  // Prepare sample data as fallback
  const sampleData = [
    { month: 'Jan', sales: 1000 },
    { month: 'Feb', sales: 1200 },
    { month: 'Mar', sales: 900 },
    { month: 'Apr', sales: 1500 },
    { month: 'May', sales: 1300 },
  ];

  // Use dashboard data if available, otherwise use sample data
  const chartData = dashboardData?.monthlySales?.length 
    ? dashboardData.monthlySales.map(item => ({
        month: item.month,
        sales: item.total
      }))
    : sampleData;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading dashboard data</div>;

  return (
    <div className="p-4">
      <Typography variant="h4" className="mb-4">
        Sales Dashboard
      </Typography>

      {/* Total Sales Summary */}
      <Card className="p-4 mb-4">
        <Typography variant="h5">
          Total Sales: ₹{dashboardData?.totalSales?.toLocaleString() || 'N/A'}
        </Typography>
      </Card>

      {/* Sales Chart */}
      <Card className="p-4">
        <Typography variant="h6" className="mb-4">
          Monthly Sales
        </Typography>
        
        <BarChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#8884d8" />
        </BarChart>

        {/* Debug Information */}
        {/* <div className="mt-4 p-2 bg-gray-100 rounded">
          <Typography variant="small">
            Debug Data: {JSON.stringify(dashboardData)}
          </Typography>
        </div> */}
      </Card>
    </div>
  );
};

// Ensure default export
export default Dashboard;