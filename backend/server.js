const express = require('express');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoute');
const discountCodeRoutes = require('./routes/discountRoute');
const productRoutes = require('./routes/productRoute');
const chatbotRoutes = require('./routes/chatbotRoute');


//Routes
const authRoutes = require('./routes/authRoute');
const adminRoutes = require('./routes/adminRoute');
const userRoutes = require('./routes/userRoute');

const app = express();
const port = 3000;
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Cấu hình CORS cho phép gửi cookie
const corsOptions = {
  origin: "http://localhost:5173", // Địa chỉ frontend của bạn
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Quan trọng để gửi cookie
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(passport.initialize());
require('./config/passport');
app.use(express.json());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);


app.use('/api/orders', orderRoutes);
app.use('/api/discount-codes', discountCodeRoutes);
app.use('/api/products', productRoutes);


app.use('/api/chatbot', chatbotRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}