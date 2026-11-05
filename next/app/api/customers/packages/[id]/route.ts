import { NextRequest, NextResponse } from "next/server";
import { PackageModel } from "../../../shared/models/package";

export const GET = async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) => {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json(
                { success: false, message: "Package id is required" },
                { status: 400 },
            );
        }

        const response = await PackageModel.getPackageDoc({ id });
        if (!response) {
            return NextResponse.json(
                { success: false, message: "Package not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: response,
            message: "Package retrieved successfully!",
        });
    } catch (error) {
        console.error("Could not load package", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong. Please try again in a moment.",
            },
            { status: 500 },
        );
    }
};
