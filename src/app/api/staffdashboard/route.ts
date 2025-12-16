import { NextResponse } from "next/server";
import db from "@/app/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface JwtPayload {
    id: number;
    email: string;
    companyId: number;
    branchId: number;
    role: string;
}

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        if (decoded.role !== "staff") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const staffId = decoded.id;



        // Fetch selected services along with service, branch, and staff name
        const [services]: [RowDataPacket[], unknown] = await db.query(
            `SELECT 
      s.id AS selected_service_id,
      s.service_id,
      s.price,
      srv.name AS service_name,
      b.name AS branch_name,
      s.created_at AS selected_date
   FROM staff_selected_services s
   JOIN allservices srv ON s.service_id = srv.id
   JOIN branch b ON s.branch_id = b.id
   WHERE s.staff_id = ?`,
            [staffId]
        );





        return NextResponse.json({ success: true, services });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
}
