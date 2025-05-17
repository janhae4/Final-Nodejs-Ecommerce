import { Card, Row, Col, Typography } from "antd";
import { RiseOutlined, FallOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;
const MetricCard = ({ title, value, icon, change, changeType }) => (
  <Card>
    <Row align="middle" gutter={16}>
      <Col>
        <div style={{ fontSize: 24 }}>{icon}</div>
      </Col>
      <Col flex="auto">
        <Text type="secondary">{title}</Text>
        <Title level={3} style={{ margin: "8px 0" }}>
          {value}
        </Title>
        <Text type={changeType === "increase" ? "success" : "danger"}>
          {changeType === "increase" ? <RiseOutlined /> : <FallOutlined />}
          {change}%
        </Text>
      </Col>
    </Row>
  </Card>
);
export default MetricCard;
