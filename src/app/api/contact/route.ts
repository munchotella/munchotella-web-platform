import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, phone, message } = await request.json();

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('Missing EMAIL_USER or EMAIL_PASS environment variables.');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: emailUser,
      to: 'munchotella@gmail.com',
      subject: `[Website Form] Mesaj nou de la ${name}`,
      text: `Ai primit un mesaj nou de pe site-ul Munchotella:\n\nNume: ${name}\nTelefon: ${phone}\n\nMesaj:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-w-xl mx-auto p-6 bg-[#fcf9f4] color: #1A120B;">
          <h2 style="color: #D4A853;">Ai primit un mesaj nou de pe site</h2>
          <p><strong>Nume:</strong> ${name}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          <p><strong>Mesaj:</strong></p>
          <blockquote style="border-left: 4px solid #D4A853; padding-left: 1rem; font-style: italic;">
            ${message.replace(/\n/g, '<br/>')}
          </blockquote>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
