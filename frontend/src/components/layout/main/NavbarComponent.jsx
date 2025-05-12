import React from "react";
import { Link } from "react-router-dom";
import { Badge, Typography } from "antd";

const { Text } = Typography;

const NavbarComponent = ({ path, icon, text, cartItemCount = null }) => {
  return (
    <Link to={`/${path}`} className="h-full">
      <div className="flex text-black items-center gap-2 hover:bg-gray-200 rounded-md p-2">
        {cartItemCount ? (
          <Badge count={cartItemCount} size="small" offset={[4, -4]}>
            {React.createElement(icon, { className: "text-lg" })}
          </Badge>
        ) : (
          React.createElement(icon, { className: "text-lg" })
        )}
        <Text className="hidden lg:inline" strong>
          {text}
        </Text>
      </div>
    </Link>
  );
};

export default NavbarComponent;
