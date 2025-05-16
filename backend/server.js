require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const {connectRabbitMQ} = require("./database/rabbitmqConnection");
const inventoryConsumer = require("./consumers/inventoryConsumer");
const loyaltyConsumer = require("./consumers/loyaltyConsumer");
const redisConsumer = require("./consumers/redisConsumer");
const emailConsumer = require("./consumers/emailConsumer");
//Routes
const orderRoutes = require("./routes/orderRoute");
const discountCodeRoutes = require("./routes/discountRoute");
const productRoutes = require("./routes/productRoute");
const chatbotRoutes = require("./routes/chatbotRoute");
const authRoutes = require("./routes/authRoute");
const adminRoutes = require("./routes/adminRoute");
const userRoutes = require("./routes/userRoute");
const guestRoutes = require("./routes/guestRoute");

const app = express();
const port = 3000;
const passport = require("passport");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Cấu hình CORS cho phép gửi cookie
const corsOptions = {
  origin: "http://localhost:5173", // Địa chỉ frontend của bạn
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true, // Quan trọng để gửi cookie
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(passport.initialize());
require("./config/passport");
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/guests", guestRoutes)

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/discount-codes", discountCodeRoutes);
app.use("/api/products", productRoutes);

app.use("/api/chatbot", chatbotRoutes);

const http = require("http");
const server = http.createServer(app);

// Tạo socket server
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Gắn io vào app để dùng trong controller
app.set("io", io);

// Lắng nghe kết nối từ client
io.on("connection", (socket) => {
  socket.on("connect", () => {
    console.log("Connected to socket server. Socket ID:", socket.id);
  });
  console.log("Client connected via socket.io");

  // Nghe event từ client
  socket.on('new-comment', (data) => {
    // Broadcast cho mọi client khác
    socket.broadcast.emit('receive-comment', data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

async function start() {
  if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    try {
      await connectRabbitMQ();
      console.log("RabbitMQ connected");

      inventoryConsumer.start();
      loyaltyConsumer.start();
      emailConsumer.start();
      redisConsumer.start();

      server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
      console.error("❌ Failed to start server:", err.message || err);
      process.exit(1);
    }
  }
}

start()
