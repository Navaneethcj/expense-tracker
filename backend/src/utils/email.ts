import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: "Expense Tracker <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2>Reset your Password</h2>

          <p>Hello,</p>

          <p>You requested a password reset.</p>

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

          <p>If the button doesn't work, copy and paste this link into your browser:</p>

          <p>${resetUrl}</p>

          <p>This link expires in <strong>1 hour</strong>.</p>

          <hr>

          <small>Expense Tracker</small>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};