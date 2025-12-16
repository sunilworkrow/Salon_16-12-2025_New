// app/api/branch/route.ts

import { NextResponse } from 'next/server';
import  db  from '@/app/lib/db';

import { RowDataPacket } from "mysql2";

import jwt from 'jsonwebtoken';

interface JwtPayload {
  companyId: any;
  id: number;
  email: string;
  companies_id: number;
}


// POST API

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Read body ONLY once
    const body = await req.json();
    const { name, address, city, state, country, pin} = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "Branch name is required" }, { status: 400 });
    }

    if (!address) {
      return NextResponse.json({ success: false, message: "Branch Address is required" }, { status: 400 });
    }

    if (!city) {
      return NextResponse.json({ success: false, message: "Branch city is required" }, { status: 400 });
    }

    if (!state) {
      return NextResponse.json({ success: false, message: "Branch state is required" }, { status: 400 });
    }

    if (!country) {
      return NextResponse.json({ success: false, message: "Branch country is required" }, { status: 400 });
    }

    if (!pin) {
      return NextResponse.json({ success: false, message: "Branch pin is required" }, { status: 400 });
    }

    const user_id = decoded.id;
    const companies_id = decoded.companyId;

    const [existing]: [RowDataPacket[], unknown] = await (await db).query(
      "SELECT * FROM branch WHERE name = ? AND companies_id = ?",
      [name, companies_id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Branch already exists" }, { status: 400 });
    }

    await (await db).query(
      "INSERT INTO branch (name, address, city, state, country, pin, user_id, companies_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, address, city, state, country, pin, user_id, companies_id]
    );

    return NextResponse.json({ success: true, message: "Branch created successfully" });

  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}


// GET API: 
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const companies_id = decoded.companyId;

    const [rows]: [RowDataPacket[], unknown] = await (await db).query(
      'SELECT * FROM branch WHERE companies_id = ?',
      [companies_id]
    );

    return NextResponse.json({ success: true, data: rows });

  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}



// Edit API

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const { id, name, address, city, state, country, pin } = body;

    if (!id || !name || !address || !city || !state || !country || !pin) {
      return NextResponse.json(
        { success: false, message: "All fields (id, name, address, city, state, country, pin) are required" },
        { status: 400 }
      );
    }

    await (await db).query(
      "UPDATE branch SET name = ?, address = ?, city = ?, state = ?, country = ?, pin = ? WHERE id = ?",
      [name, address, city, state, country, pin, id]
    );

    return NextResponse.json({
      success: true,
      message: 'Branch updated successfully',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}


// DELETE API: 

// DELETE API:
export async function DELETE(req: Request) {
  try {
    // ✅ Check for Authorization token
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const companies_id = decoded.companyId;

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    // ✅ Optionally ensure the branch belongs to the same company before deleting
    await (await db).query("DELETE FROM branch WHERE id = ? AND companies_id = ?", [id, companies_id]);

    return NextResponse.json({
      success: true,
      message: "Branch deleted successfully",
    });

  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
