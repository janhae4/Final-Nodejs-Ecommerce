import React from "react";
import { Timeline, Tag, Typography, Card, Divider } from "antd";
import { ClockCircleOutlined, HistoryOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const RenderStatusHistory = ({
  statusHistory,
  currentStatus,
  getStatusColor,
}) => {
  if (
    !statusHistory ||
    !Array.isArray(statusHistory) ||
    statusHistory.length === 0
  ) {
    return (
      <Card
        title={
          <Divider orientation="left">
            <ClockCircleOutlined /> Status History
          </Divider>
        }
        variant="borderless"
        style={{ boxShadow: "none" }}
        styles={{ header: { borderBottom: "none" } }}
        className="h-full"
      >
        <Text italic>No status history available</Text>
      </Card>
    );
  }

  const fullStatusHistory = [
    ...statusHistory,
    ...(statusHistory.some(
      (item) =>
        item.status === currentStatus &&
        item.timestamp === statusHistory[statusHistory.length - 1].timestamp
    )
      ? []
      : [
          {
            status: currentStatus,
            timestamp: new Date().toISOString(),
            _id: "current-status",
          },
        ]),
  ];

  // Sort by timestamp (newest first)
  const sortedHistory = [...fullStatusHistory].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <Card
      title={
        <Divider orientation="left">
          <ClockCircleOutlined /> Status History
        </Divider>
      }
      variant="borderless"
      style={{ boxShadow: "none" }}
      styles={{ header: { borderBottom: "none" } }}
      className="h-full"
    >
      <Timeline
        items={sortedHistory.map((item, index) => ({
          color: getStatusColor(item.status),
          children: (
            <div>
              <Tag color={getStatusColor(item.status)} className="mb-1">
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Tag>
              <div>
                <Text type="secondary">
                  {dayjs(item.timestamp).format("DD/MM/YYYY HH:mm:ss")}
                </Text>
              </div>
            </div>
          ),
        }))}
      />
    </Card>
  );
};

export default RenderStatusHistory;
