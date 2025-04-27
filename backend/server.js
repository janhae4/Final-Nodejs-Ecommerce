const express = require('express');
const mongoose = require('mongoose');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath()
const cors = require('cors');
const orderRoutes = require('./order.routes');
const discountCodeRoutes = require('./routes/discountRoute');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(pathToSwaggerUi))

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  });
app.use('/api/orders', orderRoutes);
app.use('/api/discount-codes', discountCodeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});