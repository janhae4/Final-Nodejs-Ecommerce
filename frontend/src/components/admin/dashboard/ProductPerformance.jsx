import { Card, Col, Row } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const retroColors = [
  "#ECFAE5",
  "#DDF6D2",
  "#CAE8BD",
  "#B0DB9C",
  "#A0C878", // Nhạt - hồng pastel
];

const ProductPerformance = ({ data }) => (
  <Card title="Product Distribution">
    <Row gutter={16}>
      <Col span={24}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data?.topProducts}>
            <CartesianGrid stroke="none" />
            <XAxis dataKey="nameProduct" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="soldQuantity" name="Sold" stroke="none">
              {data?.topProducts?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={retroColors[index % retroColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  </Card>
);

export default ProductPerformance;
