import { Drawer, Input, List, Spin, Button, Typography} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Text } = Typography;
const MobileSearchDrawer = ({
  mobileSearchOpen,
  setMobileSearchOpen,
  searchRef,
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  setShowSearchResults,
}) => {
  const navigate = useNavigate();
  return (
    <Drawer
      title="Tìm kiếm"
      placement="top"
      closable={true}
      onClose={() => {
        setMobileSearchOpen(false);
        setShowSearchResults(false);
      }}
      open={mobileSearchOpen}
      height="100%"
      className="p-4"
    >
      <div className="relative" ref={searchRef}>
        <Input
          size="large"
          placeholder="Tìm kiếm sản phẩm..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="rounded-lg mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />

        {isSearching ? (
          <div className="flex justify-center py-8">
            <Spin tip="Đang tìm kiếm..." />
          </div>
        ) : searchQuery ? (
          searchResults.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                  onClick={() => {
                    // Handle navigation to product
                    setMobileSearchOpen(false);
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar shape="square" size={50} src={item.image} />
                    }
                    title={item.name}
                    description={`${item.price.toLocaleString("vi-VN")}đ`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <div className="py-8 text-center">
              <Text className="text-gray-500">
                Không tìm thấy sản phẩm phù hợp
              </Text>
              <div className="mt-2">
                <Button
                  type="primary"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    navigate("/products");
                    setMobileSearchOpen(false);
                  }}
                >
                  Xem tất cả sản phẩm
                </Button>
              </div>
            </div>
          )
        ) : (
          <div>
            <Text className="text-gray-500">Gợi ý tìm kiếm phổ biến:</Text>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Laptop", "Điện thoại", "Máy tính bảng", "Tai nghe"].map(
                (keyword) => (
                  <Button
                    key={keyword}
                    onClick={() => setSearchQuery(keyword)}
                    className="rounded-full"
                  >
                    {keyword}
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default MobileSearchDrawer;
