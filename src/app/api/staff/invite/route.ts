import { NextResponse } from "next/server";
import db from "@/app/lib/db";
import crypto from 'crypto';
import { RowDataPacket } from "mysql2";
import * as bravokey from '@sendinblue/client';



export async function POST(req: Request) {


    try {

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
        }

        const [userResult]: [RowDataPacket[], unknown] = await db.query(
            'SELECT * FROM signup WHERE email = ?',
            [email]
        );


        const resetToken = crypto.randomBytes(20).toString('hex');

        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await db.query(
            'UPDATE signup SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
            [resetToken, tokenExpiry, email]
        );

        console.log("this my token", resetToken);

        const staffLink = `http://localhost:3000/staff-invite?token=${resetToken}&email=${email}`;

        console.log("Reset link:", staffLink);


        const brevoApiKey = process.env.BREVO_API_KEY;


        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": brevoApiKey!,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    name: "Your Company Name",
                    email: "ksunil@workrow.io",
                },
                to: [{ email }],
                subject: "You're invited to join our system",
                htmlContent: `
                    <div style="font-family:Arial;font-size:16px;">
                        <h2>Welcome!</h2>
                        <p>You have been invited to join our system as staff.</p>
                        <p>Please click the button below to complete your account setup:</p>
                        
                         <a href="${staffLink}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none;">Set staff Password</a>
                        <br><br>
                        <p>Thank you!</p>
                    </div>
                `,
            }),
        });


        // <a href="https://yourapp.com/staff-register?email=${email}"
        //                    style="padding:10px 18px;background:#007bff;color:white;text-decoration:none;border-radius:4px;">
        //                    Accept Invite
        //                 </a>

        // return NextResponse.json({
        //     success: true,
        //     message: "Invitationbdfhjkdjhfbgdksjhkj sent successfully!",
        // });

        if (!response.ok) {
            const error = await response.text();
            console.error("Brevo error:", error);
            return NextResponse.json({ success: false, message: "Failed to send email" });
        }

        return NextResponse.json({
            success: true,
            message: "Invitation sent successfully!",
        });


    } catch (err) {
        console.error("Invite API error:", err);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }


}

