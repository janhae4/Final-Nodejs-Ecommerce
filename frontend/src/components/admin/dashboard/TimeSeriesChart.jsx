import { Card } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const TimeSeriesChart = ({ data, interval }) => (
  <Card
    title={`Performance Trends (${interval})`}
    style={{ minHeight: "28rem" }}
  >
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#1890ff" />
        <Line type="monotone" dataKey="profit" stroke="#52c41a" />
        <Line type="monotone" dataKey="product" stroke="#722ed1" />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);
export default TimeSeriesChart;