import { Card } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const PieChartPerformance = ({ data }) => {
  const retroColors = [
    "#ADB2D4",
    "#B1C29E",
    "#FADA7A",
    "#F0A04B",
    "#BE5B50", 
  ];

  return (
    <Card title="Product Types Distribution">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={110} // tăng kích thước Pie chart
            fill="#8884d8"
            dataKey="quantity"
            nameKey="category"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={retroColors[index % retroColors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PieChartPerformance;
