const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOrderConfirmation = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.userInfo.email,
    subject: `Order Confirmation - ${order.orderCode}`,
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
            display: flex;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s;
          }
          
          .product-item:hover {
            background-color: #f5f5f5;
          }
          
          .product-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 15px;
            border: 1px solid #e0e0e0;
          }
          
          .product-info {
            flex: 1;
          }
          
          .product-name {
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
          }
          
          .product-variant {
            font-size: 13px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .product-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .product-quantity {
            background-color: #f0f0f0;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 13px;
          }
          
          .product-price {
            font-weight: bold;
            color: #2E7D32;
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
            <p class="order-number">Order Code: ${order.orderCode}</p>
            <p><strong>Purchase Date:</strong> ${order.date}</p>
            <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">${order.status?.toUpperCase()}</span></p>
          </div>
          
          <h3>Products:</h3>
           <div class="product-list">
              ${order.products
                .map(
                  (p) => `
                <div class="product-item">
                  <img src="${
                    p.productImage ||
                    "https://via.placeholder.com/60?text=Product"
                  }" 
                      alt="${p.productName}" 
                      class="product-image">
                  <div class="product-info">
                    <div class="product-name">${p.productName}</div>
                    ${
                      p.variantName
                        ? `<div class="product-variant">Variant: ${p.variantName}</div>`
                        : ""
                    }
                    <div class="product-meta">
                      <span class="product-quantity">Qty: ${p.quantity}</span>
                      <span class="product-price">${(
                        p.price * p.quantity
                      ).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}</span>
                    </div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
            
            <div class="total">
              Total Amount: $${order.totalAmount.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
          </div>
          
          <div class="points">
            <span style="font-size: 18px;">🎁</span> You earned ${
              order.loyaltyPointsEarned
            } loyalty points with this order!
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="#" class="button">Track Your Order</a>
          </div>
          
          <div class="footer">
            <p>If you have any questions about your order, please contact our customer support.</p>
            <p>© ${new Date().getFullYear()} SHOP. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

exports.sendRegisterConfirmation = async (user, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `CONFIRM YOUR REGISTRATION - SHOP`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
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
          .user-details {
            margin-bottom: 25px;
          }
          .user-details p {
            margin: 8px 0;
          }
          .credential-box {
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .credential-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .credential-item:last-child {
            border-bottom: none;
          }
          .credential-label {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
            color: #555;
          }
          .credential-value {
            background-color:#4CAF50;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: monospace;
            letter-spacing: 0.5px;
          }
          .password-notice {
            background-color: #FFF3CD;
            padding: 12px;
            border-radius: 5px;
            margin-top: 20px;
            text-align: center;
            font-weight: bold;
            border: 1px dashed #FFC107;
            color: #856404;
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
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
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
          <h1>Welcome to SHOP!</h1>
        </div>
        <div class="content">
          <div class="user-details">
            <h2>Hi, ${user.fullName},</h2>
            <p>Thank you for registering with us. Here are your login credentials:</p>
          </div>
          
          <div class="credential-box">
            <div class="credential-item">
              <span class="credential-label">username:</span>
              <div class="credential-value">${user.email}</div>
            </div>
            <div class="credential-item">
              <span class="credential-label">password:</span>
              <div class="credential-value">${password}</div>
            </div>
          </div>
          
          <div class="password-notice">
            <span style="font-size: 18px;">🔐</span>
            Update your password immediately after logging in.
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="http://localhost:5173/auth/login" class="button">Go to Login</a>
          </div>
          
          <div class="footer">
            <p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>
            <p>© ${new Date().getFullYear()} SHOP. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};
