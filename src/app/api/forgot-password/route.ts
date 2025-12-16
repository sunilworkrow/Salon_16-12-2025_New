import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
import crypto from 'crypto';
import { RowDataPacket } from "mysql2";
import * as bravokey from '@sendinblue/client';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }


    const [userResult]: [RowDataPacket[], unknown] = await db.query(
      'SELECT * FROM signup WHERE email = ?',
      [email]
    );

    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }



    const resetToken = crypto.randomBytes(20).toString('hex');

    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'UPDATE signup SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [resetToken, tokenExpiry, email]
    );

    console.log("this my token", resetToken);



    const resetLink = `http://82.25.108.209:3001/reset-password?token=${resetToken}&email=${email}`;

    console.log("Reset link:", resetLink);



    // ✅ Brevo email sending
    const brevoClient = new bravokey.TransactionalEmailsApi();

    brevoClient.setApiKey(
      bravokey.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY as string
    );

    console.log("BREVO_API_KEY:", process.env.BREVO_API_KEY);



    const webhookResponse = await fetch('https://ai.workrow.io/webhook/24d32655-6c8a-484e-9f03-5cba40dff9c3', {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Reset email sent successfully!',
        email,
        resetLink
      })
    });



    if (!webhookResponse.ok) {
      console.error('Failed to send data to n8n:', await webhookResponse.text());
    }


    // console.log("API", brevoClient);

    // return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });


    //  try {
    //   const result = await brevoClient.sendTransacEmail({
    //     sender: {
    //       email: 'ksunil@workrow.io',
    //       name: 'workrow',
    //     },
    //     to: [{ email }],
    //     subject: 'Reset your password',
    //     htmlContent: `
    //   <h2>Password Reset</h2>
    //   <p>Click the link below to reset your password:</p>
    //   <a href="${resetLink}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none;">Reset Password</a>
    //   <p>This link will expire in 1 hour.</p>
    // `,
    //   });

    //   console.log("Brevo Email Sent Successfully:", result);
    // } catch (emailError: any) {
    //   console.error("❌ Brevo Email Send Error:", emailError.response?.body || emailError.message || emailError);
    //   return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
    // }


    // return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });



    return NextResponse.json({
      success: true,
      message: 'Reset email sent successfully!',
      resetLink
    });

  } catch (error: unknown) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
