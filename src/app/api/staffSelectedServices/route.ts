import { NextResponse } from "next/server";
import db from "@/app/lib/db";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  email: string;
  companyId: number;
  branchId: number;
  role: string;
}

export async function POST(req: Request) {
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
    const companiesId = decoded.companyId;
    const branchId = (decoded as any).branchId; // make sure your token includes branchId
    const body = await req.json();
    const { services } = body;

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ success: false, message: "No services provided" }, { status: 400 });
    }

    const values = services.map((s: { id: number; price: number }) => [
      staffId,
      companiesId,
      branchId,
      s.id,
      s.price,
    ]);

    await db.query(
      `INSERT INTO staff_selected_services (staff_id, companies_id, branch_id, service_id, price) VALUES ?`,
      [values]
    );

    return NextResponse.json({ success: true, message: "Services submitted successfully" });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
