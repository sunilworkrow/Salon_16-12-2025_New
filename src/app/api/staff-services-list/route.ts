import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';

interface JwtPayload {
    id: number;
    email: string;
    companyId: number;
}


// get staff cients


export async function GET(req: Request) {


    try {

        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }



        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        const companies_id = decoded.companyId;

        const [clients]: [RowDataPacket[], unknown] = await (await db).query(
            `SELECT 
         ss.*,
         b.name AS branch_name,
         a.name AS service_name,
         s.name AS staff_name
       FROM staff_selected_services ss
       LEFT JOIN branch b ON ss.branch_id = b.id
       LEFT JOIN allservices a ON ss.service_id = a.id
       LEFT JOIN signup s ON ss.staff_id = s.id
       WHERE ss.companies_id = ?`,
            [companies_id]
        );



        return NextResponse.json({ success: true, data: clients });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }

}
