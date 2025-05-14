// src/components/auth/SocialAuthButtons.jsx
import React from 'react';
import { Button } from 'antd';
import { GoogleOutlined, FacebookFilled } from '@ant-design/icons';

const SocialAuthButtons = ({ onGoogleLogin, onFacebookLogin }) => {
  return (
    <div className="space-y-2">
      <Button
        type="primary"
        icon={<GoogleOutlined />}
        onClick={onGoogleLogin}
        block
        className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 flex items-center justify-center"
      >
        Login with Google
      </Button>
      <Button
        type="primary"
        icon={<FacebookFilled />}
        onClick={onFacebookLogin}
        block
        className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 flex items-center justify-center"
      >
        Login with Facebook
      </Button>
    </div>
  );
};

export default SocialAuthButtons;