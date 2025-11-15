import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

type ResponseData = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { to, companyName, userName, userEmail } = req.body;

  if (!to || !companyName) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Configure nodemailer with Google SMTP
  const gmailUser = process.env.GMAIL_USER || 'demoday@gmail.com';
  const gmailPassword = process.env.GMAIL_APP_PASSWORD || 'gweu jwha ihpg hazn';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });

  try {
    const mailOptions = {
      from: gmailUser,
      to: to,
      subject: `Connection Request - ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7B00;">New Connection Request</h2>
          <p>Hello,</p>
          <p>You have received a connection request from someone interested in <strong>${companyName}</strong>.</p>
          ${userName ? `<p><strong>Name:</strong> ${userName}</p>` : ''}
          ${userEmail ? `<p><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>` : ''}
          <p>This request was sent through the MARL Accelerator Demo Day platform.</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            MARL Accelerator Demo Day Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send email' 
    });
  }
}

