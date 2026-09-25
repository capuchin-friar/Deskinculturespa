import { NextResponse } from "next/server";
import { query } from "../lib/database";

export const GET = async () => {
  try {
    const { rows } = await query(
      `SELECT id, consultant_id, mode, duration_minutes, price, is_active
       FROM consultation_offerings
       WHERE is_active = true
       ORDER BY duration_minutes ASC, price ASC`,
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Failed to load consultation offerings", error);
    return NextResponse.json({ success: false, data: "Unable to load consultation offerings" }, { status: 500 });
  }
};
