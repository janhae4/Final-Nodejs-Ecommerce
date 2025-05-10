import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Input,
  Avatar,
  Tooltip,
  Upload,
  message,
  Spin,
  Typography,
} from "antd";
import {
  MessageOutlined,
  SendOutlined,
  PictureOutlined,
  CloseOutlined,
  RobotOutlined,
  PaperClipOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Text } = Typography;

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      content: "Xin chào! Tôi là trợ lý AI của SHOP. Bạn cần giúp đỡ gì không?",
      time: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom when new messages come in
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setOpen(!open);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !fileInputRef.current?.files?.length) return;

    // Add user message to chat
    const userMessage = {
      sender: "user",
      content: inputMessage,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    setIsTyping(true);

    const content = await getBotResponse(inputMessage);
    const botResponse = {
      sender: "bot",
      content,
      time: new Date(),
    };

    setMessages((prev) => [...prev, botResponse]);
    setIsTyping(false);
  };

  const getBotResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    const response = await axios.post(`${API_URL}/chatbot/`, { prompt: input });
    return response.data;
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (info) => {
    if (info.file.status === "done") {
      // Handle successful upload
      const imageMessage = {
        sender: "user",
        content: (
          <img
            src={URL.createObjectURL(info.file.originFileObj)}
            alt="Uploaded"
            style={{ maxWidth: "200px", borderRadius: "8px" }}
          />
        ),
        isImage: true,
        time: new Date(),
      };

      setMessages((prev) => [...prev, imageMessage]);

      // Bot response to image
      setIsTyping(true);
      setTimeout(() => {
        const botResponse = {
          sender: "bot",
          content:
            "Cảm ơn bạn đã gửi hình ảnh. Tôi đã nhận được và sẽ xử lý thông tin này.",
          time: new Date(),
        };

        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000);

      message.success("Tải lên hình ảnh thành công!");
    } else if (info.file.status === "error") {
      message.error("Tải lên hình ảnh thất bại!");
    }
  };

  const formatTime = (date) => {
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  // Custom upload button
  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      // Here you'd normally upload to a server
      // For demo we'll just simulate a successful upload
      setTimeout(() => {
        onSuccess("ok");
      }, 500);
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat button */}
      <Tooltip
        title={open ? "Đóng chat" : "Chat với trợ lý AI"}
        placement="left"
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={open ? <CloseOutlined /> : <MessageOutlined />}
          onClick={toggleChat}
          className={`w-14 h-14 flex items-center justify-center shadow-lg ${
            open
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        />
      </Tooltip>

      {/* Chat window */}
      {open && (
        <div
          className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl overflow-hidden"
          style={{ width: "400px", height: "500px" }}
        >
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Avatar icon={<RobotOutlined />} className="bg-blue-400 mr-2" />
              <div>
                <div className="font-medium">SHOP AI Assistant</div>
                <div className="text-xs text-blue-200">Trực tuyến</div>
              </div>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
            />
          </div>

          {/* Messages container */}
          <div className="p-3 h-96 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <Avatar
                    icon={<RobotOutlined />}
                    className="bg-blue-500 mr-2 mt-1"
                  />
                )}
                <div
                  className={`rounded-lg p-3 max-w-xs break-words ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {msg.content}
                  <div
                    className={`text-xs mt-1 ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.time)}
                  </div>
                </div>
                {msg.sender === "user" && (
                  <Avatar
                    icon={<UserOutlined />}
                    className="bg-gray-300 ml-2 mt-1"
                  />
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <Avatar icon={<RobotOutlined />} className="bg-blue-500 mr-2" />
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <Spin size="small" />{" "}
                  <span className="text-gray-500 text-sm ml-2">
                    Đang nhập...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t">
            <div className="flex">
              <Upload
                customRequest={customUpload}
                showUploadList={false}
                onChange={handleImageUpload}
                accept="image/*"
              >
                <Tooltip title="Gửi hình ảnh">
                  <Button
                    icon={<PictureOutlined />}
                    className="mr-2 flex items-center justify-center"
                  />
                </Tooltip>
              </Upload>

              <TextArea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="flex-grow mr-2"
              />

              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                disabled={!inputMessage.trim()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
