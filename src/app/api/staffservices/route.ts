// app/api/staff-services/route.ts
import { NextResponse } from "next/server";
import db from "@/app/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface JwtPayload {
  id: number;
  email: string;
  companyId: number;
  branchId: any;
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

    const companies_id = decoded.companyId;
    const branchId = decoded.branchId;

    const [services]: [RowDataPacket[], unknown] = await db.query(
      `SELECT s.id AS service_id, s.name AS service_name, s.price AS service_price, c.id AS category_id, s.image AS service_image, c.name AS category_name
       FROM allservices s
       JOIN category c ON s.category_id = c.id
      WHERE s.companies_id = ? AND s.branch_id = ?`,
      [companies_id, branchId]
    );

    return NextResponse.json({ success: true, data: services });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
