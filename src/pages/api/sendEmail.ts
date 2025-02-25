// pages/api/sendEmail.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

interface EmailRequest {
  yourName: string;
  yourEmail: string;
  issue: string;
  issueTime: string;
}

export default async function sendEmail(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }
console.log(req.body)
  const { yourName, yourEmail, issue, issueTime } = req.body as EmailRequest;
  
  const transporter = nodemailer.createTransport({
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // replace with your SES user
      pass: process.env.EMAIL_PASS // replace with your SES password
    },
    tls: {
        // Configuración adicional TLS si es necesario
        ciphers: 'HIGH',
        rejectUnauthorized: false // Solo para pruebas, no usar en producción
      }
  });

  const mailOptions = {
    from: 'noreply@ciifm.com', // sender address
    to: 'help@forkliftiq360.com ', // list of receivers
    subject: 'New Ticket Created', // Subject line
    text: `A new ticket has been created by ${yourName} (${yourEmail}). Issue: ${issue}. Time occurred: ${issueTime}`, // plain text body
    html: `<b>A new ticket has been created by ${yourName} (${yourEmail}).</b><p>Issue: ${issue}</p><p>Time occurred: ${issueTime}</p>`, // html body
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Failed to send email', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to send email', error: error.message });
    } else {
      res.status(500).json({ message: 'Failed to send email', error: 'An unknown error occurred' });
    }
  }
}
