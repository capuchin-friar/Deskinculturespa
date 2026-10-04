import { db, query } from "../database";

export type WeeklyAvailability = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_interval_minutes: number;
  timezone: string;
  is_available: boolean;
};

export type AvailabilityBookingContext = {
  id: number;
  user_id: string;
  service_id: number;
  admin_id: number;
  duration_minutes: number | null;
  scheduled_at: Date | string | null;
  status: string;
};

type OccupiedBooking = { scheduled_at: Date | string; duration_minutes: number | null };
type CustomerBookingForSlot = AvailabilityBookingContext & {
  category: string | null;
  subcategory: string | null;
  price: string | number;
  service_is_active: boolean;
  kind?: "service" | "consultation";
};
type RawOccupiedBooking = OccupiedBooking & { user_id: string };

const supportedTimezones = new Set(["Africa/Lagos", "UTC", "Europe/London", "America/New_York"]);

function parseClock(value: string) {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function partsInZone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function zonedDateTimeToUtc(dateText: string, minuteOfDay: number, timezone: string) {
  const [year, month, day] = dateText.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day, Math.floor(minuteOfDay / 60), minuteOfDay % 60);
  let guess = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = partsInZone(new Date(guess), timezone);
    const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    guess += target - represented;
  }
  const result = new Date(guess);
  const actual = partsInZone(result, timezone);
  if (actual.year !== String(year).padStart(4, "0")
    || actual.month !== String(month).padStart(2, "0")
    || actual.day !== String(day).padStart(2, "0")
    || actual.hour !== String(Math.floor(minuteOfDay / 60) % 24).padStart(2, "0")
    || actual.minute !== String(minuteOfDay % 60).padStart(2, "0")) return new Date(Number.NaN);
  return result;
}

function weekdayInZone(dateText: string, timezone: string) {
  const noonUtc = zonedDateTimeToUtc(dateText, 12 * 60, timezone);
  const weekday = partsInZone(noonUtc, timezone).weekday;
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

function dateInZone(date: Date | string, timezone: string) {
  const parts = partsInZone(new Date(date), timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addIsoDays(dateText: string, amount: number) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function makeSlots(dateText: string, duration: number, rule: WeeklyAvailability, occupied: OccupiedBooking[]) {
  const opening = parseClock(rule.start_time);
  const closing = parseClock(rule.end_time);
  if (opening === null || closing === null || duration <= 0) return [];
  const interval = Number(rule.slot_interval_minutes);
  const busy = occupied.map((entry) => {
    const start = new Date(entry.scheduled_at).getTime();
    const minutes = Number(entry.duration_minutes) || interval;
    return [start, start + minutes * 60_000];
  });
  const slots = [];
  for (let minute = opening; minute + duration <= closing; minute += interval) {
    const startsAt = zonedDateTimeToUtc(dateText, minute, rule.timezone);
    if (Number.isNaN(startsAt.getTime())) continue;
    const endsAt = startsAt.getTime() + duration * 60_000;
    if (startsAt <= new Date()) continue;
    if (busy.some(([busyStart, busyEnd]) => startsAt.getTime() < busyEnd && endsAt > busyStart)) continue;
    slots.push({
      time: `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`,
      scheduled_at: startsAt.toISOString(),
    });
  }
  return slots;
}

function groupServicesByAdmin(bookings: CustomerBookingForSlot[]) {
  const groups = new Map<number, CustomerBookingForSlot[]>();
  for (const booking of bookings) {
    const group = groups.get(Number(booking.admin_id)) || [];
    group.push(booking);
    groups.set(Number(booking.admin_id), group);
  }
  return groups;
}

function groupOccupiedBookings(rows: RawOccupiedBooking[], rules: WeeklyAvailability[], timezone: string): OccupiedBooking[] {
  const grouped = new Map<string, OccupiedBooking>();
  for (const row of rows) {
    const date = dateInZone(row.scheduled_at, timezone);
    const rule = rules.find((candidate) => candidate.day_of_week === weekdayInZone(date, timezone));
    const duration = Number(row.duration_minutes) || Number(rule?.slot_interval_minutes) || 30;
    const key = `${row.user_id}:${new Date(row.scheduled_at).getTime()}`;
    const existing = grouped.get(key);
    if (existing) existing.duration_minutes = Number(existing.duration_minutes || 0) + duration;
    else grouped.set(key, { scheduled_at: row.scheduled_at, duration_minutes: duration });
  }
  return [...grouped.values()];
}

export class AvailabilityModel {
  static getAdminRules(adminId: number) {
    return query<WeeklyAvailability>(
      `SELECT day_of_week, to_char(start_time, 'HH24:MI') AS start_time,
              to_char(end_time, 'HH24:MI') AS end_time,
              slot_interval_minutes, timezone, is_available
       FROM admin_weekly_availability WHERE admin_id = $1 ORDER BY day_of_week`,
      [adminId],
    ).then(({ rows }) => rows);
  }

  static saveAdminRules(adminId: number, rules: WeeklyAvailability[]) {
    return (async () => {
      const client = await db();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))", [String(adminId), "admin-availability"]);
        await client.query("DELETE FROM admin_weekly_availability WHERE admin_id = $1", [adminId]);
        for (const rule of rules) {
          await client.query(
            `INSERT INTO admin_weekly_availability
             (admin_id, day_of_week, start_time, end_time, slot_interval_minutes, timezone, is_available)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [adminId, rule.day_of_week, rule.start_time, rule.end_time, rule.slot_interval_minutes, rule.timezone, rule.is_available],
          );
        }
        await client.query("COMMIT");
        return this.getAdminRules(adminId);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    })();
  }

  static async getCustomerMonthAvailability(userId: string, month: string) {
    const [{ rows: services }, { rows: consultations }] = await Promise.all([
      query<CustomerBookingForSlot>(
      `SELECT b.id, b.user_id, b.service_id, b.scheduled_at, b.status, b.price,
              s.admin_id, s.duration_minutes, s.category, s.subcategory,
              s.is_active AS service_is_active, 'service' AS kind
       FROM bookings b JOIN services s ON s.id = b.service_id
       WHERE b.user_id = $1 AND b.status IN ('pending', 'confirmed')
       ORDER BY b.id`,
      [userId],
      ),
      query<CustomerBookingForSlot>(
        `SELECT a.id, a.customer_id AS user_id, a.offering_id AS service_id,
                a.scheduled_at, a.status, a.amount AS price, a.consultant_id AS admin_id,
                c.duration_minutes, c.slug AS category,
                COALESCE(a.consultation_name, c.slug) AS subcategory,
                c.is_active AS service_is_active, 'consultation' AS kind
         FROM appointments a JOIN consultations c ON c.id = a.offering_id
         WHERE a.customer_id = $1 AND a.status IN ('pending', 'confirmed')
         ORDER BY a.id`,
        [userId],
      ),
    ]);
    const bookings = [...services, ...consultations];
    if (bookings.some((booking) => !booking.service_is_active)) {
      return { bookings, timezone: "Africa/Lagos", dates: {}, error: "SERVICE_UNAVAILABLE" as const };
    }
    if (!bookings.length) return { bookings, timezone: "Africa/Lagos", dates: {} };

    const grouped = groupServicesByAdmin(bookings);
    const availabilityByAdmin = await Promise.all([...grouped.keys()].map(async (adminId) => {
      const rules = (await this.getAdminRules(adminId)).filter((rule) => rule.is_available);
      return [adminId, rules] as const;
    }));
    const rulesByAdmin = new Map(availabilityByAdmin);
    const referenceRules = [...rulesByAdmin.values()].find((rules) => rules.length) || [];
    const timezone = referenceRules[0]?.timezone || "Africa/Lagos";
    const today = dateInZone(new Date(), timezone);
    const [year, monthNumber] = month.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const firstDay = `${month}-01`;
    const lastDay = `${month}-${String(daysInMonth).padStart(2, "0")}`;
    const from = new Date(zonedDateTimeToUtc(firstDay, 0, timezone).getTime() - 2 * 86_400_000);
    const to = new Date(zonedDateTimeToUtc(addIsoDays(lastDay, 1), 0, timezone).getTime() + 2 * 86_400_000);
    const targetBookingIds = services.map((booking) => Number(booking.id));
    const targetAppointmentIds = consultations.map((booking) => Number(booking.id));
    const occupiedByAdmin = new Map<number, OccupiedBooking[]>();
    await Promise.all([...grouped.keys()].map(async (adminId) => {
      const { rows } = await query<RawOccupiedBooking>(
        `SELECT user_id, scheduled_at, SUM(duration_minutes)::integer AS duration_minutes
         FROM (
           SELECT b.user_id, b.scheduled_at, s.duration_minutes, b.id, 'service' AS kind
           FROM bookings b JOIN services s ON s.id = b.service_id
           WHERE s.admin_id = $1 AND b.status IN ('pending', 'confirmed')
             AND b.scheduled_at IS NOT NULL AND b.scheduled_at >= $2 AND b.scheduled_at < $3
           UNION ALL
           SELECT a.customer_id AS user_id, a.scheduled_at, c.duration_minutes, a.id, 'consultation' AS kind
           FROM appointments a JOIN consultations c ON c.id = a.offering_id
           WHERE a.consultant_id = $1 AND a.status IN ('pending', 'confirmed')
             AND a.scheduled_at IS NOT NULL AND a.scheduled_at >= $2 AND a.scheduled_at < $3
         ) occupied
         WHERE (kind = 'service' AND NOT (id = ANY($4::int[])))
            OR (kind = 'consultation' AND NOT (id = ANY($5::int[])))
         GROUP BY user_id, scheduled_at`,
        [adminId, from, to, targetBookingIds, targetAppointmentIds],
      );
      const rules = rulesByAdmin.get(adminId) || [];
      const adminTimezone = rules[0]?.timezone || timezone;
      occupiedByAdmin.set(adminId, groupOccupiedBookings(rows, rules, adminTimezone));
    }));

    const dates: Record<string, ReturnType<typeof makeSlots>> = {};
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${month}-${String(day).padStart(2, "0")}`;
      if (date < today) continue;
      let sharedSlots: Map<string, ReturnType<typeof makeSlots>[number]> | null = null;
      let everyAdminHasHours = true;
      for (const [adminId, adminBookings] of grouped) {
        const rules = rulesByAdmin.get(adminId) || [];
        const adminTimezone = rules[0]?.timezone || timezone;
        const candidateSlots = new Map<string, ReturnType<typeof makeSlots>[number]>();
        let hasWindow = false;
        for (const offset of [-1, 0, 1]) {
          const localDate = addIsoDays(date, offset);
          const rule = rules.find((candidate) => candidate.day_of_week === weekdayInZone(localDate, adminTimezone));
          if (!rule) continue;
          const duration = adminBookings.reduce(
            (total, booking) => total + (Number(booking.duration_minutes) || Number(rule.slot_interval_minutes)),
            0,
          );
          const opening = parseClock(rule.start_time);
          const closing = parseClock(rule.end_time);
          if (opening !== null && closing !== null) {
            for (let minute = opening; minute + duration <= closing; minute += Number(rule.slot_interval_minutes)) {
              const startsAt = zonedDateTimeToUtc(localDate, minute, rule.timezone);
              if (!Number.isNaN(startsAt.getTime()) && dateInZone(startsAt, timezone) === date) {
                hasWindow = true;
                break;
              }
            }
          }
          const slots = makeSlots(localDate, duration, rule, occupiedByAdmin.get(adminId) || []);
          for (const slot of slots) {
            if (dateInZone(slot.scheduled_at, timezone) === date) candidateSlots.set(slot.scheduled_at, slot);
          }
        }
        if (!hasWindow) everyAdminHasHours = false;
        if (sharedSlots === null) sharedSlots = candidateSlots;
        else for (const candidate of sharedSlots.keys()) if (!candidateSlots.has(candidate)) sharedSlots.delete(candidate);
      }
      if (everyAdminHasHours && sharedSlots) dates[date] = [...sharedSlots.values()];
    }
    return { bookings, timezone, dates };
  }

  static async scheduleCustomerBookings(userId: string, scheduledAt: string) {
    const selectedDate = new Date(scheduledAt);
    if (Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) return { error: "SLOT_UNAVAILABLE" as const };
    const client = await db();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))", [userId, "customer-bookings"]);
      const { rows: services } = await client.query<CustomerBookingForSlot>(
        `SELECT b.id, b.user_id, b.service_id, b.scheduled_at, b.status, b.price,
                s.admin_id, s.duration_minutes, s.category, s.subcategory,
                s.is_active AS service_is_active, 'service' AS kind
         FROM bookings b JOIN services s ON s.id = b.service_id
         WHERE b.user_id = $1 AND b.status IN ('pending', 'confirmed')
         ORDER BY b.id FOR UPDATE OF b`,
        [userId],
      );
      const { rows: consultations } = await client.query<CustomerBookingForSlot>(
        `SELECT a.id, a.customer_id AS user_id, a.offering_id AS service_id,
                a.scheduled_at, a.status, a.amount AS price, a.consultant_id AS admin_id,
                c.duration_minutes, c.slug AS category,
                COALESCE(a.consultation_name, c.slug) AS subcategory,
                c.is_active AS service_is_active, 'consultation' AS kind
         FROM appointments a JOIN consultations c ON c.id = a.offering_id
         WHERE a.customer_id = $1 AND a.status IN ('pending', 'confirmed')
         ORDER BY a.id FOR UPDATE OF a`,
        [userId],
      );
      const bookings = [...services, ...consultations];
      if (!bookings.length) {
        await client.query("ROLLBACK");
        return { error: "BOOKING_NOT_FOUND" as const };
      }
      if (bookings.some((booking) => !booking.service_is_active)) {
        await client.query("ROLLBACK");
        return { error: "SERVICE_UNAVAILABLE" as const };
      }

      const grouped = groupServicesByAdmin(bookings);
      const adminIds = [...grouped.keys()].sort((left, right) => left - right);
      for (const adminId of adminIds) {
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))", [String(adminId), "admin-availability"]);
      }
      const { rows: allRules } = await client.query<WeeklyAvailability>(
        `SELECT admin_id, day_of_week, to_char(start_time, 'HH24:MI') AS start_time,
                to_char(end_time, 'HH24:MI') AS end_time, slot_interval_minutes, timezone, is_available
         FROM admin_weekly_availability
         WHERE admin_id = ANY($1::bigint[]) AND is_available = TRUE`,
        [adminIds],
      );
      const rulesByAdmin = new Map(adminIds.map((adminId) => [
        adminId,
        allRules.filter((rule) => Number((rule as WeeklyAvailability & { admin_id: number }).admin_id) === adminId),
      ]));
      const lockTargets = adminIds.map((adminId) => {
        const rules = rulesByAdmin.get(adminId) || [];
        const timezone = rules[0]?.timezone || "Africa/Lagos";
        return { adminId, timezone, date: dateInZone(selectedDate, timezone) };
      }).sort((left, right) => left.adminId - right.adminId || left.date.localeCompare(right.date));
      for (const target of lockTargets) {
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))", [String(target.adminId), target.date]);
      }

      const targetBookingIds = services.map((booking) => Number(booking.id));
      const targetAppointmentIds = consultations.map((booking) => Number(booking.id));
      for (const adminId of adminIds) {
        const rules = rulesByAdmin.get(adminId) || [];
        const timezone = rules[0]?.timezone || "Africa/Lagos";
        const localDate = dateInZone(selectedDate, timezone);
        const rule = rules.find((candidate) => candidate.day_of_week === weekdayInZone(localDate, timezone));
        if (!rule) {
          await client.query("ROLLBACK");
          return { error: "SLOT_UNAVAILABLE" as const };
        }
        const adminBookings = grouped.get(adminId) || [];
        const duration = adminBookings.reduce(
          (total, booking) => total + (Number(booking.duration_minutes) || Number(rule.slot_interval_minutes)),
          0,
        );
        const startOfDay = zonedDateTimeToUtc(localDate, 0, timezone);
        const endOfDay = zonedDateTimeToUtc(addIsoDays(localDate, 1), 0, timezone);
        const { rows: occupiedRows } = await client.query<RawOccupiedBooking>(
          `WITH booked_windows AS (
             SELECT user_id, scheduled_at, SUM(duration_minutes)::integer AS duration_minutes
             FROM (
               SELECT b.user_id, b.scheduled_at, COALESCE(s.duration_minutes, $3) AS duration_minutes,
                      b.id, 'service' AS kind
               FROM bookings b JOIN services s ON s.id = b.service_id
               WHERE s.admin_id = $1 AND b.status IN ('pending', 'confirmed') AND b.scheduled_at IS NOT NULL
               UNION ALL
               SELECT a.customer_id AS user_id, a.scheduled_at, c.duration_minutes,
                      a.id, 'consultation' AS kind
               FROM appointments a JOIN consultations c ON c.id = a.offering_id
               WHERE a.consultant_id = $1 AND a.status IN ('pending', 'confirmed') AND a.scheduled_at IS NOT NULL
             ) all_bookings
             WHERE (kind = 'service' AND NOT (id = ANY($2::int[])))
                OR (kind = 'consultation' AND NOT (id = ANY($6::int[])))
             GROUP BY user_id, scheduled_at
           )
           SELECT user_id, scheduled_at, duration_minutes FROM booked_windows
           WHERE scheduled_at < $4
             AND scheduled_at + (duration_minutes * INTERVAL '1 minute') > $5`,
          [adminId, targetBookingIds, Number(rule.slot_interval_minutes), endOfDay, startOfDay, targetAppointmentIds],
        );
        const slots = makeSlots(localDate, duration, rule, occupiedRows);
        if (!slots.some((slot) => new Date(slot.scheduled_at).getTime() === selectedDate.getTime())) {
          await client.query("ROLLBACK");
          return { error: "SLOT_UNAVAILABLE" as const };
        }
      }

      const scheduledAt = selectedDate.toISOString();
      const { rowCount: bookingCount } = await client.query(
        `UPDATE bookings SET scheduled_at = $1, updated_at = NOW()
         WHERE user_id = $2 AND id = ANY($3::int[]) AND status IN ('pending', 'confirmed')
         RETURNING id`,
        [scheduledAt, userId, targetBookingIds],
      );
      let appointmentCount = 0;
      for (const appointment of consultations) {
        const rules = rulesByAdmin.get(Number(appointment.admin_id)) || [];
        const timezone = rules[0]?.timezone || "Africa/Lagos";
        const startsInZone = partsInZone(selectedDate, timezone);
        const endsInZone = partsInZone(new Date(selectedDate.getTime() + Number(appointment.duration_minutes || 0) * 60_000), timezone);
        const { rowCount } = await client.query(
          `UPDATE appointments
           SET scheduled_at = $1, appointment_date = $2::date, start_time = $3::time,
               end_time = $4::time, updated_at = NOW()
           WHERE customer_id = $5 AND id = $6 AND status IN ('pending', 'confirmed')`,
          [scheduledAt, `${startsInZone.year}-${startsInZone.month}-${startsInZone.day}`,
            `${startsInZone.hour}:${startsInZone.minute}:00`, `${endsInZone.hour}:${endsInZone.minute}:00`, userId, appointment.id],
        );
        appointmentCount += Number(rowCount || 0);
      }
      if (bookingCount !== targetBookingIds.length || appointmentCount !== targetAppointmentIds.length) {
        await client.query("ROLLBACK");
        return { error: "BOOKING_NOT_FOUND" as const };
      }
      const { rows: updatedBookings } = await client.query(
        `SELECT b.*, s.category, s.subcategory, s.description, s.duration_minutes, s.image_url
         FROM bookings b JOIN services s ON s.id = b.service_id
         WHERE b.user_id = $1 AND b.id = ANY($2::int[]) ORDER BY b.id`,
        [userId, targetBookingIds],
      );
      const { rows: updatedAppointments } = await client.query(
        `SELECT a.*, c.slug, c.mode, c.duration_minutes
         FROM appointments a JOIN consultations c ON c.id = a.offering_id
         WHERE a.customer_id = $1 AND a.id = ANY($2::int[]) ORDER BY a.id`,
        [userId, targetAppointmentIds],
      );
      await client.query("COMMIT");
      return { bookings: updatedBookings, consultations: updatedAppointments };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

}

export const isSupportedAvailabilityTimezone = (value: string) => supportedTimezones.has(value);
