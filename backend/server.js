const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoute');
const discountCodeRoutes = require('./routes/discountRoute');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/discount-codes', discountCodeRoutes);


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});