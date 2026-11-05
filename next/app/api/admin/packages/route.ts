import { NextRequest, NextResponse } from "next/server";
import { getRequestAdminId } from "@/app/api/shared/adminAuth";
import { PackageModel } from "../../shared/models/package";

export const GET = async (request: NextRequest) => {
    try {
        const admin_id = await getRequestAdminId(request);

        if (!admin_id) {
            return NextResponse.json(
                { success: false, data: "Authentication required" },
                { status: 401 },
            );
        }

        const response = await PackageModel.getAllPackageDoc();

        return NextResponse.json({
            success: true,
            data: response,
            message: "Packages retrieved successfully!",
        });
    } catch (error) {
        console.error("Could not load packages", error);
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 },
        );
    }
};
