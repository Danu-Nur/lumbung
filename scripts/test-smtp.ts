import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("📧 Testing SMTP Connection...");
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Test" <noreply@test.com>',
            to: "test@example.com", // Mailtrap captures this
            subject: "Test Email from Inventory Pro",
            text: "If you receive this, SMTP is working!",
            html: "<b>If you receive this, SMTP is working!</b>",
        });

        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }
}

main();
