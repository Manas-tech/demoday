import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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

  const { to, companyName, userName, userEmail, founders } = req.body;

  if (!to || !companyName || !userName || !userEmail) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Configure nodemailer with Google SMTP
  const gmailUser = process.env.GMAIL_USER || 'demoday@gmail.com';
  const gmailPassword = process.env.GMAIL_APP_PASSWORD || 'gweu jwha ihpg hazn';
  const fromEmail = process.env.FROM_EMAIL || 'no-reply@demoday.marlvc.com';
  const supportEmail = process.env.SUPPORT_EMAIL || 'prakash@marlaccelerator.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_ORIGIN || process.env.SITE_URL || 'https://demoday.marlvc.com';
  
  // Extract first founder name if multiple founders are listed
  const founderName = founders ? (founders.split(',')[0].trim() || founders.split(' and ')[0].trim()) : null;
  
  // Read logo file for email attachment
  let logoPath = '';
  let logoMimeType = 'image/jpeg';
  try {
    // Try JPG file from public folder first
    const jpgPath = path.join(process.cwd(), 'public', 'thumbnail_MARL_Logo.jpg');
    if (fs.existsSync(jpgPath)) {
      logoPath = jpgPath;
      logoMimeType = 'image/jpeg';
    } else {
      // Try root directory as fallback
      const rootJpgPath = path.join(process.cwd(), 'thumbnail_MARL_Logo.jpg');
      if (fs.existsSync(rootJpgPath)) {
        logoPath = rootJpgPath;
        logoMimeType = 'image/jpeg';
      } else {
        // Fallback to PNG if JPG doesn't exist
        const pngPath = path.join(process.cwd(), 'public', 'marl-logo.png');
        if (fs.existsSync(pngPath)) {
          logoPath = pngPath;
          logoMimeType = 'image/png';
        }
      }
    }
  } catch (error) {
    console.error('Error finding logo file:', error);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });

  try {
    // Email template matching the example
    const founderText = founderName ? `the founder, <strong>${founderName}</strong>,` : 'the founder';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          ${logoPath ? `
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
            <tr>
              <td style="text-align: center;">
                <img 
                  src="cid:marl-logo" 
                  alt="MARL Accelerator" 
                  width="120" 
                  style="max-width: 120px; height: auto; margin-bottom: 10px; display: block; border: 0; outline: none; text-decoration: none;" 
                />
              </td>
            </tr>
          </table>
          ` : ''}
          <div style="font-size: 24px; font-weight: 700; color: #333; margin-bottom: 5px;">MARL</div>
          <div style="font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">accelerator</div>
        </div>
        <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #333; margin: 0 0 20px 0;">
            Marl Accelerator Demo Day Connection Request
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 16px 0;">
            Hi ${userName},
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 16px 0;">
            Thanks for your interest in <strong>${companyName}</strong>! We'd love for you to connect directly with ${founderText} to continue the conversation.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 16px 0;">
            Feel free to reach out to schedule a call and explore potential collaboration.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            If you need any assistance or if we can be of help, please don't hesitate to contact us at <a href="mailto:${supportEmail}" style="color: #FF7B00; text-decoration: none;">${supportEmail}</a>.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0;">
            Best regards,<br>
            <strong>The MARL Accelerator Team</strong>
          </p>
        </div>
      </div>
    `;

    // Prepare attachments if logo exists
    const attachments = [];
    if (logoPath && fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'marl-logo.jpg',
        path: logoPath,
        cid: 'marl-logo' // Content ID for referencing in HTML
      });
    }

    // Send one email to both the requester and the founder
    const mailOptions = {
      from: `"MARL Accelerator" <${fromEmail}>`,
      to: `${userName} <${userEmail}>, ${companyName} <${to}>`,
      replyTo: fromEmail,
      subject: `${userName} <> ${companyName}`,
      html: emailHtml,
      attachments: attachments
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

