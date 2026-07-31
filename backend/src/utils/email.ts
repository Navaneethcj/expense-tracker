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

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h2>Reset your Password</h2>

        <p>Hello,</p>

        <p>You requested a password reset for your Expense Tracker account.</p>

        <p>
          <a href="${resetUrl}"
             style="
               background:#2563eb;
               color:white;
               padding:12px 20px;
               text-decoration:none;
               border-radius:6px;
               display:inline-block;
             ">
             Reset Password
          </a>
        </p>

        <p>If the button doesn't work, copy this link:</p>

        <p>${resetUrl}</p>

        <p>This link expires in <strong>1 hour</strong>.</p>

        <p>If you didn't request this, you can safely ignore this email.</p>

        <hr>

        <small>Expense Tracker</small>
      </div>
    `,
  });
};