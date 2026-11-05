import { NextRequest, NextResponse } from "next/server";
import { readJsonObject } from "@/app/api/shared/utils/request";
import { getRequestAdminId } from "@/app/api/shared/adminAuth";
import { PackageModel } from "@/app/api/shared/models/package";

export const DELETE = async (req: NextRequest) => {
    try {
        const body = await readJsonObject(req);
        const package_id = body.package_id ?? body.id;

        if (package_id == null || String(package_id).trim() === "") {
            return NextResponse.json({ message: "Package ID is required" }, { status: 400 });
        }

        const admin_id = await getRequestAdminId(req);
        if (!admin_id) {
            return NextResponse.json({ success: false, data: "Authentication required" }, { status: 401 });
        }

        await PackageModel.deletePackageDoc({ id: String(package_id).trim() });

        return NextResponse.json({
            success: true,
            message: "Package deleted successfully",
        });
    } catch (err) {
        console.error("err: ", err);
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 },
        );
    }
};
