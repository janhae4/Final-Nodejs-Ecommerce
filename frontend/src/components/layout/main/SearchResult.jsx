import { Avatar, Button, List, Spin, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { Divider } from "antd";
import { Link } from "react-router-dom";
const { Text } = Typography;

const SearchResultRender = ({
  searchQuery,
  searchResults,
  isSearching,
  setShowSearchResults,
}) => {
  return searchResults ? (
    <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-4">
        {isSearching ? (
          <div className="flex justify-center py-8">
            <Spin tip="Searching..." />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <Text className="font-medium">
                Result for: <span className="font-bold">{searchQuery}</span>
              </Text>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setShowSearchResults(false)}
              />
            </div>
            <Divider className="my-2" />
            {searchResults.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={searchResults}
                renderItem={(item) => (
                  <Link to={`/products/detail/${item.slug}`}>
                  <List.Item
                    className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                    onClick={() => {
                      // Handle navigation to product
                      setShowSearchResults(false);
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar shape="square" size={50} src={item.image} />
                      }
                      title={item.nameProduct}
                      description={`${Number(item.price).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}`}
                    />
                  </List.Item>
                  </Link>
                )}
              />
            ) : (
              <div className="py-8 text-center">
                <Text className="text-gray-500">
                  Cannot find any results for:{" "}
                  <span className="font-bold">{searchQuery}</span>
                </Text>
                <div className="mt-2">
                  <Button type="primary">See all results</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  ) : null;
};

export default SearchResultRender;
