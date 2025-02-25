import nodemailer from 'nodemailer'
import aws from 'aws-sdk'

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "20501d371cf666",
      pass: "deff6e4bac4a9b"
    }
  });

// const transporter = nodemailer.createTransport({
//     SES: new aws.SES({ apiVersion: '2010-12-01' }),
// });

export const sendTicketNotification = async (email) => {
    //const resetUrl = ${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/${token};

    const mailOptions = {
        from: 'diego.cotrian@gmail.com',
        to: email,
        subject: 'Test ticket',
        html: <p>Esto es un test... Ehelpdesk </p>,
    };

    return transport.sendMail(mailOptions);
};