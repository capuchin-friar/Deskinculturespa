import { NextRequest, NextResponse } from "next/server";
import { getRequestAdminId } from "@/app/api/shared/adminAuth";
import { SlotModel } from "@/app/api/shared/models/slot";

export async function GET(request: NextRequest) {
    const adminId = await getRequestAdminId(request);
    if (!adminId) {
        return NextResponse.json(
            { success: false, message: "Authentication required" },
            { status: 401 },
        );
    }

    try {
        const { searchParams } = request.nextUrl;
        const kind = searchParams.get("kind") || "all";
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (!from || !to) {
            return NextResponse.json(
                { success: false, message: "from and to dates are required." },
                { status: 400 },
            );
        }

        const data = await SlotModel.getAdminSlots({ kind, from, to });
        return NextResponse.json({
            success: true,
            timezone: "Africa/Lagos",
            data,
        });
    } catch (error) {
        console.error("Could not load admin slots", error);
        return NextResponse.json(
            { success: false, message: "Could not load slots." },
            { status: 500 },
        );
    }
}
