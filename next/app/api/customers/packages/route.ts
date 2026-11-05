import { NextResponse } from "next/server";
import { PackageModel } from "../../shared/models/package";

export const GET = async () => {
    try {
        const response = await PackageModel.getActivePackageDoc();

        return NextResponse.json({
            success: true,
            data: response,
            message: "Packages retrieved successfully!",
        });
    } catch (error) {
        console.error("Could not load packages", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong. Please try again in a moment.",
            },
            { status: 500 },
        );
    }
};
