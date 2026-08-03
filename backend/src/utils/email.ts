import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection when the server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Verify Error:", error);
  } else {
    console.log("✅ SMTP Server is ready");
  }
});

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  console.log("📧 Sending reset email to:", email);
  console.log("🔗 Reset URL:", resetUrl);

  try {
    const info = await transporter.sendMail({
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <h2>Reset Password</h2>
        <p>Click below to reset your password.</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    });

    console.log("✅ Email sent successfully");
    console.log(info);
  } catch (err) {
    console.error("❌ Email sending failed");
    console.error(err);
    throw err;
  }
};