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
  Badge,
  Divider,
  Space,
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
  FileOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Text, Title } = Typography;

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      content: "Hello! I'm the SHOP AI assistant. How can I help you today?",
      time: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

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
    if (!inputMessage.trim() && !selectedFile) return;

    const userMessage = {
      sender: "user",
      content: inputMessage,
      time: new Date(),
      file: selectedFile,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setSelectedFile(null);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append("prompt", inputMessage);

      // Fix here: directly append the originFileObj if it exists
      if (selectedFile?.originFileObj) {
        formData.append("image", selectedFile.originFileObj);
      }

      // Add debugging for the form data
      console.log("Form data entries:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] + ": " + (pair[1] instanceof File ? pair[1].name : pair[1])
        );
      }

      const response = await axios.post(`${API_URL}/chatbot/`, formData, {
        // Important: Add this header for FormData with files
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const botResponse = {
        sender: "bot",
        content: response.data,
        time: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          content: "I encountered an error. Please try again later.",
          time: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (info) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} uploaded successfully`);

      // FIX: Include the originFileObj in the selectedFile state
      setSelectedFile({
        name: info.file.name,
        size: info.file.size,
        type: info.file.type,
        url: URL.createObjectURL(info.file.originFileObj),
        originFileObj: info.file.originFileObj, // Store the original File object
      });
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} upload failed`);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const formatTime = (date) => {
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Custom upload button
  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      // Here we're just simulating a successful upload to Ant Design's Upload component
      // The actual file upload to the server happens in handleSendMessage
      setTimeout(() => {
        onSuccess("ok");
      }, 500);
    } catch (err) {
      onError(err);
    }
  };

  const renderFilePreview = (file) => {
    if (!file) return null;

    const isImage = file.type.startsWith("image/");

    return (
      <div className="mt-2 p-3 bg-gray-100 max-w-60 max-h-60 rounded-lg">
        <div className="flex flex-col items-center justify-between mb-2">
          <Text className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </Text>
        </div>
        {isImage && (
          <div className="mt-2">
            <img
              src={file.url}
              alt={file.name}
              className="w-40 h-40 object-contain rounded-md mx-auto"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-2 md:right-6 z-50">
      {/* Chat button */}
      <Badge dot={messages.length > 1} color="red">
        <Tooltip
          title={open ? "Close chat" : "Chat with AI assistant"}
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
      </Badge>

      {/* Chat window */}
      {open && (
        <div
          className="rounded-lg overflow-hidden absolute bottom-20 right-0 bg-white shadow-xl transition-all duration-300 ease-in-out"
          style={{
            width: "380px",
            maxWidth: "95vw",
            height: "500px",
            maxHeight: "80vh",
          }}
        >
          {/* Chat header */}
          <div className="bg-blue-600 relative text-white p-2 flex items-center justify-between">
            <div className="flex items-center">
              <Avatar
                icon={<RobotOutlined />}
                className="bg-blue-400 mr-3"
                size="large"
              />
              <div>
                <div className="font-medium text-lg">SHOP AI Assistant</div>
                <div className="text-xs text-blue-200 flex items-center">
                  <Badge status="success" className="mr-1" />
                  <span>Online</span>
                </div>
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
          <div
            ref={chatContainerRef}
            className="p-4 overflow-y-auto bg-gray-50"
            style={{ height: "calc(100% - 70px - 100px)" }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <Avatar
                    icon={<RobotOutlined />}
                    className="bg-blue-500 mr-2 mt-1 flex-shrink-0"
                    size="large"
                  />
                )}
                <div
                  className={`rounded-lg p-3 max-w-xs break-words ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : msg.isError
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {msg.file && renderFilePreview(msg.file)}
                  {msg.file && msg.content && <Divider className="my-2" />}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 flex justify-end ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.time)}
                  </div>
                </div>
                {msg.sender === "user" && (
                  <Avatar
                    icon={<UserOutlined />}
                    className="bg-gray-300 ml-2 mt-1 flex-shrink-0"
                    size="large"
                  />
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <Avatar
                  icon={<RobotOutlined />}
                  className="bg-blue-500 mr-2"
                  size="large"
                />
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center">
                    <Spin size="small" />
                    <span className="text-gray-500 text-sm ml-2">
                      Typing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Selected file preview */}
          {selectedFile && (
            <div className="px-4 relative py-2 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileOutlined className="text-blue-600 mr-2" />
                  <Text ellipsis className="max-w-xs">
                    {selectedFile.name}
                  </Text>
                  <Text className="text-xs text-gray-500 ml-2">
                    ({formatFileSize(selectedFile.size)})
                  </Text>
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={removeSelectedFile}
                  className="text-gray-500"
                />
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="p-4 border-t relative bg-white">
            <div className="flex flex-col">
              <div className="flex items-center">
                <Upload
                  customRequest={customUpload}
                  showUploadList={false}
                  onChange={handleFileUpload}
                  accept="image/*" // Restrict to images per your backend config
                >
                  <Tooltip title="Attach image">
                    <Button
                      icon={<PaperClipOutlined />}
                      className="mr-2 flex items-center justify-center"
                    />
                  </Tooltip>
                </Upload>

                <TextArea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  autoSize={{ minRows: 1, maxRows: 2 }}
                  className="flex-grow mr-2 overflow-y-scroll"
                />

                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                  disabled={!inputMessage.trim() && !selectedFile}
                />
              </div>
              <div className="mt-2 text-xs text-gray-500 text-right">
                Press Enter to send, Shift+Enter for a new line
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
