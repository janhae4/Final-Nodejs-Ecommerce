const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoute');
const discountCodeRoutes = require('./routes/discountRoute');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const port = 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API documentation for the E-commerce application'
    },
  },
  apis: ['./routes/*.js']
}

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use('/api/discount-codes', discountCodeRoutes);


app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});