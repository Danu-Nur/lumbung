import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@inventorypro.com',
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}

export async function sendLowStockAlert({
    productName,
    sku,
    currentStock,
    threshold,
    warehouse,
    recipientEmail,
}: {
    productName: string;
    sku: string;
    currentStock: number;
    threshold: number;
    warehouse: string;
    recipientEmail: string;
}) {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
          .product-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ Low Stock Alert</h2>
          </div>
          <div class="content">
            <div class="alert-box">
              <strong>Attention Required:</strong> Stock level has fallen below the threshold.
            </div>
            <div class="product-info">
              <h3>${productName}</h3>
              <p><strong>SKU:</strong> ${sku}</p>
              <p><strong>Warehouse:</strong> ${warehouse}</p>
              <p><strong>Current Stock:</strong> ${currentStock} units</p>
              <p><strong>Threshold:</strong> ${threshold} units</p>
            </div>
            <p>Please reorder this product to maintain adequate inventory levels.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Inventory Pro</p>
          </div>
        </div>
      </body>
    </html>
  `;

    return sendEmail({
        to: recipientEmail,
        subject: `Low Stock Alert: ${productName}`,
        html,
    });
}

export async function sendUserInvite({
    email,
    name,
    organizationName,
    tempPassword,
}: {
    email: string;
    name: string;
    organizationName: string;
    tempPassword: string;
}) {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .credentials { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border: 2px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to Inventory Pro!</h2>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>You have been invited to join <strong>${organizationName}</strong> on Inventory Pro.</p>
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p><strong>Important:</strong> Please change your password after your first login.</p>
            <a href="${process.env.NEXTAUTH_URL}/login" class="button">Login to Inventory Pro</a>
          </div>
          <div class="footer">
            <p>This is an automated message from Inventory Pro</p>
          </div>
        </div>
      </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: `Invitation to ${organizationName} - Inventory Pro`,
        html,
    });
}
