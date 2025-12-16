// app/api/Login/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import db from '@/app/lib/db'
import { RowDataPacket } from "mysql2";


// const JWT_SECRET = 's8f92hdg73hf!@#asf987a9sdfhajsd';

export async function POST(req: Request) {
    try {

        const body = await req.json();
        const { email, password } = body;


        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        //  user exists

        const [userRows]: [RowDataPacket[], unknown] = await db.query('SELECT * FROM signup WHERE email = ?', [email]);

        if (userRows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        const user = userRows[0];

        // Check password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }



        const [companyRows]: [RowDataPacket[], unknown] = await db.query(
            'SELECT id FROM companies WHERE user_id = ?', [user.id]
        );

        // const companyId = companyRows.length > 0 ? companyRows[0].id : null;

        let companyId = null;

        if (user.role === 'admin') {
            const [companyRows]: [RowDataPacket[], unknown] = await db.query(
                'SELECT id FROM companies WHERE user_id = ?',
                [user.id]
            );
            companyId = companyRows.length > 0 ? companyRows[0].id : null;
        } else if (user.role === 'staff') {
            companyId = user.companies_id;
        }



        let branchName = null;

        if (user.branch_id) {
            const [branchRows]: [RowDataPacket[], unknown] = await db.query(
                'SELECT name FROM branch WHERE id = ?',
                [user.branch_id]
            );

            branchName = branchRows.length > 0 ? branchRows[0].name : null;
        }




        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role, companyId: companyId, branchId: user.branch_id },
            process.env.JWT_SECRET!,
            { expiresIn: '7h' }
        );




        console.log("Token Name", token);

        console.log("user Name", companyId, user.email);

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: companyId, branchId: user.branch_id,  branchName: branchName }
        });




    }

    catch (error: unknown) {
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }

}