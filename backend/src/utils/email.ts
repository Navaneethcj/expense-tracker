import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    console.log("========== RESEND ==========");
    console.log("Recipient:", email);

    const result = await resend.emails.send({
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

          <p>If the button doesn't work:</p>

          <p>${resetUrl}</p>

          <p>This link expires in 1 hour.</p>

          <hr>

          <small>Expense Tracker</small>
        </div>
      `,
    });

    console.log("EMAIL SENT");
    console.log(result);

  } catch (err) {
    console.error("RESEND ERROR");
    console.error(err);
    throw err;
  }
};