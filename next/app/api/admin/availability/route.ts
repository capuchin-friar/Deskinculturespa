import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "../../shared/jwt";
import { AvailabilityModel, isSupportedAvailabilityTimezone, type WeeklyAvailability } from "../../shared/models/availability";
import { readJsonObject } from "../../shared/utils/request";

function getAdminId(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  return token ? decodeAdminPayload(token).id : null;
}

export async function GET(request: NextRequest) {
  try {
    const adminId = getAdminId(request);
    if (!adminId) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    const data = await AvailabilityModel.getAdminRules(adminId);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load availability." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminId = getAdminId(request);
    if (!adminId) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    const body = await readJsonObject(request);
    if (!Array.isArray(body.rules)) return NextResponse.json({ success: false, message: "Availability rules are required." }, { status: 400 });
    const rules: WeeklyAvailability[] = [];
    const seenDays = new Set<number>();
    let configuredTimezone: string | null = null;
    for (const raw of body.rules) {
      if (!raw || typeof raw !== "object") return NextResponse.json({ success: false, message: "Invalid availability rule." }, { status: 400 });
      const row = raw as Record<string, unknown>;
      const day = Number(row.day_of_week);
      const interval = Number(row.slot_interval_minutes);
      const start = typeof row.start_time === "string" ? row.start_time : "";
      const end = typeof row.end_time === "string" ? row.end_time : "";
      const timezone = typeof row.timezone === "string" ? row.timezone : "";
      if (!Number.isInteger(day) || day < 0 || day > 6 || seenDays.has(day)
        || !/^([01]\d|2[0-3]):[0-5]\d$/.test(start)
        || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)
        || start >= end || !Number.isInteger(interval) || interval < 5 || interval > 240
        || !isSupportedAvailabilityTimezone(timezone)
        || (configuredTimezone !== null && configuredTimezone !== timezone)) {
        return NextResponse.json({ success: false, message: "Check each weekday, opening time, closing time, interval, and time zone." }, { status: 400 });
      }
      configuredTimezone = timezone;
      seenDays.add(day);
      rules.push({ day_of_week: day, start_time: start, end_time: end, slot_interval_minutes: interval, timezone, is_available: true });
    }
    const data = await AvailabilityModel.saveAdminRules(adminId, rules);
    return NextResponse.json({ success: true, data, message: "Availability saved." });
  } catch {
    return NextResponse.json({ success: false, message: "Could not save availability." }, { status: 500 });
  }
}
