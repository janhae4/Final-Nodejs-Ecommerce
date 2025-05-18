require("dotenv").config();
require("./config/passport");

const express = require("express");
const cors = require("cors");

const { init } = require("./database/socketConnection");

const { connectRabbitMQ } = require("./database/rabbitmqConnection");
const inventoryConsumer = require("./consumers/inventoryConsumer");
const loyaltyConsumer = require("./consumers/loyaltyConsumer");
const redisConsumer = require("./consumers/redisConsumer");
const emailConsumer = require("./consumers/emailConsumer");
const discountConsumer = require("./consumers/discountConsumer");

//Routes
const orderRoutes = require("./routes/orderRoute");
const discountCodeRoutes = require("./routes/discountRoute");
const productRoutes = require("./routes/productRoute");
const chatbotRoutes = require("./routes/chatbotRoute");
const authRoutes = require("./routes/authRoute");
const adminRoutes = require("./routes/adminRoute");
const userRoutes = require("./routes/userRoute");
const guestRoutes = require("./routes/guestRoute");
const dashboardRoutes = require("./routes/dashboardRoute");

const app = express();
const port = 3000;
const passport = require("passport");
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.use((req, res, next) => {
  console.log('Received:', req.url);
  next();
});

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:80",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(express.json());
app.use("/api/guests", guestRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/discount-codes", discountCodeRoutes);
app.use("/api/products", productRoutes);

app.use("/api/chatbot", chatbotRoutes);

app.use("/api/dashboard", dashboardRoutes);

const http = require("http");
const server = http.createServer(app);
init(server);
async function start() {
  if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    try {
      await Promise.all([
        connectRabbitMQ(),
        inventoryConsumer.start(),
        loyaltyConsumer.start(),
        emailConsumer.start(),
        redisConsumer.start(),
        discountConsumer.start(),
      ]);
      server.listen(PORT, () => {
        console.log(`Server running on port ${port}`);
      });
    } catch (err) {
      console.error("❌ Failed to start server:", err.message || err);
      process.exit(1);
    }
  }
}

start();
