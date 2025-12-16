import { NextResponse } from "next/server";
import db from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json({ success: false, message: "Invalid link" });
    }

    // Find user with token
    const [rows]: [RowDataPacket[], unknown] = await db.query(
      `SELECT * FROM signup WHERE email = ? AND reset_token = ?`,
      [email, token]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    const user = rows[0];

    // Check expiry
    if (new Date(user.reset_token_expiry) < new Date()) {
      return NextResponse.json({
        success: false,
        message: "Verification link has expired",
      });
    }

    // Update user as verified
    await db.query(
      `UPDATE signup SET is_verified = 1, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?`,
      [email]
    );

    return NextResponse.json({
      success: true,
      message: "Account verified successfully!",
    });

  } catch (error) {
    console.error("Verify User Error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
