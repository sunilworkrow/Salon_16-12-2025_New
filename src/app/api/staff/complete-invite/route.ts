import { NextResponse } from "next/server";
import db from "@/app/lib/db";
import crypto from "crypto";
import bcrypt from 'bcrypt';
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
    try {
        const { email, token, password } = await req.json();

        if (!email || !token || !password) {
            return NextResponse.json({ success: false, message: "Invalid request." });
        }

        // Check token and expiry
        const [rows]: [RowDataPacket[], unknown] = await db.query(
            "SELECT reset_token, reset_token_expiry FROM signup WHERE email = ?",
            [email]
        );

        if (!rows.length) {
            return NextResponse.json({ success: false, message: "Invalid email." });
        }

        const user = rows[0];

        if (!user.reset_token || user.reset_token !== token) {
            return NextResponse.json({ success: false, message: "Invalid token." });
        }

        if (new Date(user.reset_token_expiry) < new Date()) {
            return NextResponse.json({ success: false, message: "Token expired." });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update DB
        await db.query(
            "UPDATE signup SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?",
            [hashedPassword, email]
        );

        return NextResponse.json({ success: true, message: "Password updated!" });

    } catch (err) {
        console.error("Complete Invite Error:", err);
        return NextResponse.json({ success: false, message: "Server error." });
    }
}
