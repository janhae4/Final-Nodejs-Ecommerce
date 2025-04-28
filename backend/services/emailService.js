const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOrderConfirmation = async (userEmail, order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #ddd;
          }
          .order-details {
            margin-bottom: 25px;
          }
          .order-details p {
            margin: 8px 0;
          }
          .order-number {
            font-size: 18px;
            color: #4CAF50;
            font-weight: bold;
          }
          .product-list {
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 25px;
          }
          .product-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
          }
          .product-item:last-child {
            border-bottom: none;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            text-align: right;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #ddd;
          }
          .points {
            background-color: #FFF9C4;
            padding: 12px;
            border-radius: 5px;
            margin-top: 20px;
            text-align: center;
            font-weight: bold;
            border: 1px dashed #FBC02D;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
            font-weight: bold;
          }
          @media only screen and (max-width: 600px) {
            body {
              padding: 10px;
            }
            .header, .content {
              padding: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Thank You For Your Order!</h1>
        </div>
        <div class="content">
          <div class="order-details">
            <p class="order-number">Order Number: ${order.orderNumber}</p>
            <p><strong>Purchase Date:</strong> ${order.purchaseDate.toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">${order.status}</span></p>
          </div>
          
          <h3>Products:</h3>
          <div class="product-list">
            ${order.products.map(p => `
              <div class="product-item">
                <div>Product ID: ${p.productId}</div>
                <div>Quantity: ${p.quantity}</div>
              </div>
            `).join('')}
            
            <div class="total">
              Total Amount: ${order.totalAmount.toLocaleString()} VND
            </div>
          </div>
          
          <div class="points">
            <span style="font-size: 18px;">🎁</span> You earned ${order.loyaltyPointsEarned} loyalty points with this order!
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="#" class="button">Track Your Order</a>
          </div>
          
          <div class="footer">
            <p>If you have any questions about your order, please contact our customer support.</p>
            <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  await transporter.sendMail(mailOptions);
};