import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spin, message } from "antd";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/profile", {
        withCredentials: true,
      });
      setAdmin(res.data);
    } catch (err) {
      message.error("Failed to fetch admin profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  if (loading) return <Spin />;

  return (
    <Card title="Admin Profile">
      <p><strong>Name:</strong> {admin.fullName}</p>
      <p><strong>Email:</strong> {admin.email}</p>
      <p><strong>Role:</strong> {admin.role}</p>
    </Card>
  );
};

export default AdminProfile;
