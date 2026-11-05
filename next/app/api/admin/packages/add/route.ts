import { NextRequest, NextResponse } from "next/server";
import { readJsonObject } from "@/app/api/shared/utils/request";
import { getRequestAdminId } from "@/app/api/shared/adminAuth";
import { PackageModel } from "@/app/api/shared/models/package";

function asIncludes(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((entry) => String(entry || "").trim())
        .filter(Boolean);
}

export const POST = async (req: NextRequest) => {
    try {
        const body = await readJsonObject(req);
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";
        const price = Number(body.price);
        const duration_months = Number(body.duration_months);
        const includes = asIncludes(body.includes);
        const image_url = typeof body.image_url === "string" ? body.image_url.trim() : "";

        if (!name) {
            return NextResponse.json({ success: false, message: "Package name is required" }, { status: 400 });
        }
        if (!description) {
            return NextResponse.json({ success: false, message: "Package description is required" }, { status: 400 });
        }
        if (!Number.isFinite(price) || price < 0) {
            return NextResponse.json({ success: false, message: "Package price is required" }, { status: 400 });
        }
        if (!Number.isInteger(duration_months) || duration_months <= 0) {
            return NextResponse.json({ success: false, message: "Package duration is required" }, { status: 400 });
        }
        if (includes.length === 0) {
            return NextResponse.json({ success: false, message: "Add at least one included item" }, { status: 400 });
        }
        if (!image_url) {
            return NextResponse.json({ success: false, message: "Package image is required" }, { status: 400 });
        }

        const admin_id = await getRequestAdminId(req);
        if (!admin_id) {
            return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
        }

        const response = await PackageModel.createPackageDoc({
            admin_id,
            name,
            description,
            price,
            duration_months,
            includes,
            image_url,
        });

        return NextResponse.json({
            success: true,
            message: "Package created successfully",
            package_id: response.id,
        });
    } catch (err) {
        console.error("err: ", err);
        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again in a moment." },
            { status: 500 },
        );
    }
};
