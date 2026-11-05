import type { PoolClient } from "pg";
import { db, query } from "../database";

export type OrderItemInput = {
  item_id: string;
  units: number;
  unit_price: number;
  total_price: number;
};

export type CreatePaidOrderPayload = {
  customerId: string;
  reference: string;
  currency?: string;
  shippingAddress: string;
  shippingMethod?: string;
  items: OrderItemInput[];
  amountPaid: number;
  shippingFee?: number;
  tax?: number;
  charges?: number;
  totalPaid: number;
  clearCart?: boolean;
};

function toMoney(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0;
}

function groupedTitle(names: string[], noun: "item" | "booking" | "appointment" | "package") {
  const cleaned = names.map((name) => String(name || "").trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return noun === "item" ? "Order" : noun === "booking" ? "Service booking" : noun === "package" ? "Package" : "Consultation";
  }
  if (cleaned.length === 1) return cleaned[0];
  const extra = cleaned.length - 1;
  const label = extra === 1 ? noun : `${noun}s`;
  return `${cleaned[0]} +${extra} other ${label}`;
}

function visitGroupKey(row: { customer_id?: string; payment?: string; payment_status?: string; scheduled_at?: Date | string | null }) {
  const payment = String(row.payment || row.payment_status || "pending").toLowerCase();
  const scheduled = row.scheduled_at ? new Date(row.scheduled_at).toISOString() : "unscheduled";
  return `${row.customer_id || ""}:${payment}:${scheduled}`;
}

function groupAdminVisits(
  rows: Array<Record<string, unknown>>,
  kind: "service" | "appointment" | "package",
  noun: "booking" | "appointment" | "package",
) {
  const groups = new Map<string, Array<Record<string, unknown>>>();
  for (const row of rows) {
    const key = visitGroupKey(row);
    const group = groups.get(key) || [];
    group.push(row);
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    const items = [...group].sort((left, right) => Number(left.id) - Number(right.id));
    const first = items[0];
    return {
      kind,
      id: first.id,
      customer_id: first.customer_id,
      customer: first.customer,
      customer_phone: first.customer_phone,
      title: groupedTitle(items.map((item) => String(item.title || "")), noun),
      qty: items.length,
      amount: items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      payment: first.payment,
      status: first.status,
      delivery: first.delivery,
      date: first.date,
      image_url: first.image_url,
    };
  });
}

export class OrderModel {
  static async createPaidOrder(payload: CreatePaidOrderPayload) {
    const client = await db();
    try {
      await client.query("BEGIN");
      const order = await this.createPaidOrderWithClient(client, payload);
      await client.query("COMMIT");
      return order;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // ignore rollback failure
      }
      throw error;
    } finally {
      client.release();
    }
  }

  static async createPaidOrderWithClient(
    client: PoolClient,
    payload: CreatePaidOrderPayload,
  ) {
    const reference = String(payload.reference || "").trim();
    const customerId = String(payload.customerId || "").trim();
    const items = payload.items.filter(
      (item) => item.item_id && Number(item.units) > 0,
    );

    if (!reference || !customerId) {
      throw new Error("Missing order customer or payment reference");
    }
    if (items.length === 0) {
      throw new Error("No order items supplied");
    }

    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [reference]);

    const { rows: existing } = await client.query(
      `SELECT * FROM orders WHERE payment_reference = $1 ORDER BY id ASC LIMIT 1`,
      [reference],
    );
    if (existing[0]) {
      if (payload.clearCart) {
        await client.query(`DELETE FROM cart_items WHERE user_id::text = $1`, [customerId]);
      }
      return { order: existing[0], created: false };
    }

    const shippingFee = toMoney(payload.shippingFee);
    const tax = toMoney(payload.tax);
    const charges = toMoney(payload.charges);
    const amountPaid = toMoney(payload.amountPaid);
    const totalPaid = toMoney(payload.totalPaid || amountPaid + shippingFee + tax + charges);

    const { rows } = await client.query(
      `INSERT INTO orders(
        customer_id, amount_paid, shipping_fee, tax, charges, total_paid,
        currency, fulfillment_status, payment_status, shipping_address,
        payment_reference, shipping_method, tracking_number
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, '')
      RETURNING *`,
      [
        customerId,
        amountPaid,
        shippingFee,
        tax,
        charges,
        totalPaid,
        payload.currency || "NGN",
        "order_placed",
        "paid",
        payload.shippingAddress || "Not provided",
        reference,
        payload.shippingMethod || "standard",
      ],
    );

    const order = rows[0];
    if (!order) {
      throw new Error("Could not create order");
    }

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items(order_id, item_id, units, unit_price, total_price)
         VALUES($1, $2, $3, $4, $5)`,
        [
          order.id,
          String(item.item_id),
          Math.max(1, Math.round(Number(item.units) || 1)),
          toMoney(item.unit_price),
          toMoney(item.total_price || Number(item.unit_price) * Number(item.units)),
        ],
      );
    }

    if (payload.clearCart) {
      await client.query(`DELETE FROM cart_items WHERE user_id::text = $1`, [customerId]);
    }

    return { order, created: true };
  }

  static async getCustomerOrders(customerId: string) {
    const { rows } = await query(
      `SELECT
         o.id,
         o.customer_id,
         o.amount_paid,
         o.shipping_fee,
         o.tax,
         o.charges,
         o.total_paid,
         o.currency,
         o.fulfillment_status,
         o.payment_status,
         o.shipping_address,
         o.payment_reference,
         o.shipping_method,
         o.estimated_delivery_date,
         o.tracking_number,
         o.created_at,
         o.updated_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'item_id', oi.item_id,
               'name', COALESCE(p.name, 'Product'),
               'thumbnail_url', p.thumbnail_url,
               'units', oi.units,
               'unit_price', oi.unit_price,
               'total_price', oi.total_price
             )
             ORDER BY oi.id
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id::text = oi.item_id
       WHERE o.customer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC, o.id DESC`,
      [customerId],
    );

    return rows;
  }

  static async getCustomerOrder(customerId: string, orderId: string) {
    const { rows } = await query(
      `SELECT
         o.id,
         o.customer_id,
         o.amount_paid,
         o.shipping_fee,
         o.tax,
         o.charges,
         o.total_paid,
         o.currency,
         o.fulfillment_status,
         o.payment_status,
         o.shipping_address,
         o.payment_reference,
         o.shipping_method,
         o.logistic_provider,
         o.estimated_delivery_date,
         o.tracking_number,
         o.created_at,
         o.updated_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'item_id', oi.item_id,
               'name', COALESCE(p.name, 'Product'),
               'thumbnail_url', p.thumbnail_url,
               'units', oi.units,
               'unit_price', oi.unit_price,
               'total_price', oi.total_price
             )
             ORDER BY oi.id
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id::text = oi.item_id
       WHERE o.customer_id = $1 AND o.id::text = $2
       GROUP BY o.id
       LIMIT 1`,
      [customerId, String(orderId)],
    );

    return rows[0] ?? null;
  }

  static async getAdminOrders() {
    const { rows: products } = await query(
      `SELECT
         'product'::text AS kind,
         o.id,
         o.customer_id::text AS customer_id,
         TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
         u.phone AS customer_phone,
         COALESCE((
           SELECT json_agg(COALESCE(p.name, 'Product') ORDER BY oi.id)
           FROM order_items oi
           LEFT JOIN products p ON p.id::text = oi.item_id
           WHERE oi.order_id = o.id
         ), '[]'::json) AS item_names,
         COALESCE((
           SELECT SUM(oi.units)::int FROM order_items oi WHERE oi.order_id = o.id
         ), 0) AS qty,
         o.total_paid AS amount,
         o.payment_status AS payment,
         o.fulfillment_status AS status,
         COALESCE(NULLIF(o.shipping_method, ''), o.tracking_number, '—') AS delivery,
         o.created_at::timestamptz AS date,
         (
           SELECT p.thumbnail_url
           FROM order_items oi
           LEFT JOIN products p ON p.id::text = oi.item_id
           WHERE oi.order_id = o.id
           ORDER BY oi.id
           LIMIT 1
         ) AS image_url
       FROM orders o
       LEFT JOIN users u ON u.id::text = o.customer_id`,
    );

    const { rows: services } = await query(
      `SELECT
         b.id,
         b.user_id::text AS customer_id,
         TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
         u.phone AS customer_phone,
         COALESCE(NULLIF(s.subcategory, ''), s.category, 'Service') AS title,
         b.price AS amount,
         b.payment_status AS payment,
         b.status,
         b.scheduled_at,
         CASE
           WHEN b.scheduled_at IS NULL THEN 'Unscheduled'
           ELSE to_char(b.scheduled_at AT TIME ZONE 'Africa/Lagos', 'YYYY-MM-DD HH24:MI')
         END AS delivery,
         b.created_at AS date,
         s.image_url
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       LEFT JOIN users u ON u.id = b.user_id`,
    );

    const { rows: packageRows } = await query(
      `SELECT
         pb.id,
         pb.user_id::text AS customer_id,
         TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
         u.phone AS customer_phone,
         COALESCE(p.name, 'Package') AS title,
         pb.price AS amount,
         pb.payment_status AS payment,
         pb.status,
         pb.scheduled_at,
         CASE
           WHEN pb.scheduled_at IS NULL THEN 'Unscheduled'
           ELSE to_char(pb.scheduled_at AT TIME ZONE 'Africa/Lagos', 'YYYY-MM-DD HH24:MI')
         END AS delivery,
         pb.created_at AS date,
         p.image_url
       FROM package_bookings pb
       INNER JOIN packages p ON p.id = pb.package_id
       LEFT JOIN users u ON u.id = pb.user_id`,
    ).catch(() => ({ rows: [] }));

    const { rows: appointments } = await query(
      `SELECT
         a.id,
         a.customer_id::text AS customer_id,
         TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
         u.phone AS customer_phone,
         COALESCE(NULLIF(a.consultation_name, ''), c.mode::text, 'Consultation') AS title,
         a.amount,
         a.payment_status::text AS payment,
         a.status::text AS status,
         a.scheduled_at,
         CASE
           WHEN a.scheduled_at IS NULL THEN 'Unscheduled'
           ELSE to_char(a.scheduled_at AT TIME ZONE 'Africa/Lagos', 'YYYY-MM-DD HH24:MI')
         END AS delivery,
         a.created_at AS date,
         c.thumbnail_url AS image_url
       FROM appointments a
       LEFT JOIN consultations c ON c.id = a.offering_id
       LEFT JOIN users u ON u.id = a.customer_id`,
    );

    const productRows = products.map((row) => {
      const rawNames = Array.isArray(row.item_names)
        ? row.item_names
        : typeof row.item_names === "string"
          ? JSON.parse(row.item_names)
          : [];
      const names = (Array.isArray(rawNames) ? rawNames : []).map((name: unknown) => String(name || ""));
      return {
        kind: "product",
        id: row.id,
        customer_id: row.customer_id,
        customer: row.customer,
        customer_phone: row.customer_phone,
        title: groupedTitle(names, "item"),
        qty: Number(row.qty) || names.length,
        amount: row.amount,
        payment: row.payment,
        status: row.status,
        delivery: row.delivery,
        date: row.date,
        image_url: row.image_url,
      };
    });

    return [
      ...productRows,
      ...groupAdminVisits(services, "service", "booking"),
      ...groupAdminVisits(appointments, "appointment", "appointment"),
      ...groupAdminVisits(packageRows, "package", "package"),
    ].sort(
      (left, right) => new Date(String(right.date || 0)).getTime() - new Date(String(left.date || 0)).getTime(),
    );
  }

  static async getAdminOrder(kind: string, id: string) {
    const normalized = String(kind || "product").toLowerCase();
    if (normalized === "service") {
      const { rows: seed } = await query(
        `SELECT user_id::text AS customer_id, payment_status, scheduled_at
         FROM bookings WHERE id::text = $1 LIMIT 1`,
        [String(id)],
      );
      if (!seed[0]) return null;
      const { rows } = await query(
        `SELECT
           b.id,
           b.user_id::text AS customer_id,
           TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
           u.email AS customer_email,
           u.phone AS customer_phone,
           u.location AS customer_location,
           COALESCE(NULLIF(s.subcategory, ''), s.category, 'Service') AS title,
           b.price AS amount,
           b.payment_status,
           b.status,
           b.scheduled_at,
           b.created_at,
           b.notes,
           s.image_url,
           s.duration_minutes
         FROM bookings b
         INNER JOIN services s ON s.id = b.service_id
         LEFT JOIN users u ON u.id = b.user_id
         WHERE b.user_id::text = $1
           AND b.payment_status = $2
           AND (
             ($3::timestamptz IS NULL AND b.scheduled_at IS NULL)
             OR b.scheduled_at = $3
           )
         ORDER BY b.id`,
        [seed[0].customer_id, seed[0].payment_status, seed[0].scheduled_at],
      );
      if (!rows[0]) return null;
      const first = rows[0];
      const items = rows.map((row) => ({
        id: row.id,
        name: row.title,
        thumbnail_url: row.image_url,
        units: 1,
        unit_price: row.amount,
        total_price: row.amount,
        duration_minutes: row.duration_minutes,
      }));
      return {
        kind: "service",
        id: first.id,
        customer_id: first.customer_id,
        customer: first.customer,
        customer_email: first.customer_email,
        customer_phone: first.customer_phone,
        customer_location: first.customer_location,
        title: groupedTitle(items.map((item) => item.name), "booking"),
        amount: items.reduce((sum, item) => sum + Number(item.total_price || 0), 0),
        payment_status: first.payment_status,
        status: first.status,
        scheduled_at: first.scheduled_at,
        created_at: first.created_at,
        notes: rows.map((row) => row.notes).find(Boolean) || "",
        items,
      };
    }

    if (normalized === "appointment") {
      const { rows: seed } = await query(
        `SELECT customer_id::text AS customer_id, payment_status::text AS payment_status, scheduled_at
         FROM appointments WHERE id::text = $1 LIMIT 1`,
        [String(id)],
      );
      if (!seed[0]) return null;
      const { rows } = await query(
        `SELECT
           a.id,
           a.customer_id::text AS customer_id,
           TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
           u.email AS customer_email,
           u.phone AS customer_phone,
           u.location AS customer_location,
           TRIM(BOTH FROM COALESCE(consultant.fname, '') || ' ' || COALESCE(consultant.lname, '')) AS consultant,
           COALESCE(NULLIF(a.consultation_name, ''), c.mode::text, 'Consultation') AS title,
           a.amount,
           a.payment_status::text AS payment_status,
           a.status::text AS status,
           a.scheduled_at,
           a.appointment_date,
           a.start_time,
           a.end_time,
           a.created_at,
           a.notes,
           c.thumbnail_url AS image_url,
           c.duration_minutes,
           c.mode
         FROM appointments a
         LEFT JOIN consultations c ON c.id = a.offering_id
         LEFT JOIN users u ON u.id = a.customer_id
         LEFT JOIN users consultant ON consultant.id = a.consultant_id
         WHERE a.customer_id::text = $1
           AND a.payment_status::text = $2
           AND (
             ($3::timestamptz IS NULL AND a.scheduled_at IS NULL)
             OR a.scheduled_at = $3
           )
         ORDER BY a.id`,
        [seed[0].customer_id, seed[0].payment_status, seed[0].scheduled_at],
      );
      if (!rows[0]) return null;
      const first = rows[0];
      const items = rows.map((row) => ({
        id: row.id,
        name: row.title,
        thumbnail_url: row.image_url,
        units: 1,
        unit_price: row.amount,
        total_price: row.amount,
        duration_minutes: row.duration_minutes,
        mode: row.mode,
      }));
      return {
        kind: "appointment",
        id: first.id,
        customer_id: first.customer_id,
        customer: first.customer,
        customer_email: first.customer_email,
        customer_phone: first.customer_phone,
        customer_location: first.customer_location,
        consultant: first.consultant,
        title: groupedTitle(items.map((item) => item.name), "appointment"),
        amount: items.reduce((sum, item) => sum + Number(item.total_price || 0), 0),
        payment_status: first.payment_status,
        status: first.status,
        scheduled_at: first.scheduled_at,
        created_at: first.created_at,
        notes: rows.map((row) => row.notes).find(Boolean) || "",
        items,
      };
    }

    const { rows } = await query(
      `SELECT
         o.id,
         o.customer_id,
         o.amount_paid,
         o.shipping_fee,
         o.tax,
         o.charges,
         o.total_paid,
         o.currency,
         o.fulfillment_status,
         o.payment_status,
         o.shipping_address,
         o.payment_reference,
         o.shipping_method,
         o.logistic_provider,
         o.estimated_delivery_date,
         o.tracking_number,
         o.created_at,
         o.updated_at,
         TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
         u.email AS customer_email,
         u.phone AS customer_phone,
         u.location AS customer_location,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'item_id', oi.item_id,
               'name', COALESCE(p.name, 'Product'),
               'thumbnail_url', p.thumbnail_url,
               'units', oi.units,
               'unit_price', oi.unit_price,
               'total_price', oi.total_price
             )
             ORDER BY oi.id
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id::text = oi.item_id
       LEFT JOIN users u ON u.id::text = o.customer_id
       WHERE o.id::text = $1
       GROUP BY o.id, u.fname, u.lname, u.email, u.phone, u.location
       LIMIT 1`,
      [String(id)],
    );

    if (!rows[0]) return null;

    const { rows: events } = await query(
      `SELECT id, event_type, stage, actor_type, outcome, notes, created_at
       FROM order_events
       WHERE order_id = $1
       ORDER BY created_at DESC, id DESC`,
      [rows[0].id],
    );

    return { kind: "product", ...rows[0], events };
  }

  static async updateAdminOrder(
    kind: string,
    id: string,
    patch: {
      status?: string;
      shipping_method?: string;
      logistic_provider?: string;
      tracking_number?: string;
      estimated_delivery_date?: string | null;
      note?: string;
    },
    actorId: number,
  ) {
    const normalized = String(kind || "product").toLowerCase();
    if (normalized === "service") {
      const current = await this.getAdminOrder("service", id);
      if (!current) return null;
      if (patch.status) {
        const ids = (current.items || []).map((item: { id: number }) => item.id);
        if (ids.length) {
          await query(`UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = ANY($2::int[])`, [
            patch.status,
            ids,
          ]);
        }
      }
      if (patch.note) {
        await query(
          `UPDATE bookings SET notes = TRIM(BOTH FROM CONCAT_WS(E'\n', notes, $1)), updated_at = NOW() WHERE id = $2`,
          [patch.note, current.id],
        );
      }
      return this.getAdminOrder("service", id);
    }

    if (normalized === "appointment") {
      const current = await this.getAdminOrder("appointment", id);
      if (!current) return null;
      if (patch.status) {
        const ids = (current.items || []).map((item: { id: number }) => item.id);
        if (ids.length) {
          await query(`UPDATE appointments SET status = $1::appointment_status, updated_at = NOW() WHERE id = ANY($2::int[])`, [
            patch.status,
            ids,
          ]);
        }
      }
      if (patch.note) {
        await query(
          `UPDATE appointments SET notes = TRIM(BOTH FROM CONCAT_WS(E'\n', notes, $1)), updated_at = NOW() WHERE id = $2`,
          [patch.note, current.id],
        );
      }
      return this.getAdminOrder("appointment", id);
    }

    const current = await this.getAdminOrder("product", id);
    if (!current) return null;

    const assignments: string[] = [];
    const values: unknown[] = [];
    const add = (column: string, value: unknown) => {
      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    };

    if (patch.status) add("fulfillment_status", patch.status);
    if (patch.shipping_method !== undefined) add("shipping_method", patch.shipping_method);
    if (patch.logistic_provider !== undefined) add("logistic_provider", patch.logistic_provider);
    if (patch.tracking_number !== undefined) add("tracking_number", patch.tracking_number);
    if (patch.estimated_delivery_date !== undefined) {
      add("estimated_delivery_date", patch.estimated_delivery_date || null);
    }

    if (assignments.length) {
      values.push(id);
      await query(
        `UPDATE orders SET ${assignments.join(", ")}, updated_at = NOW() WHERE id::text = $${values.length}`,
        values,
      );
    }

    if (patch.status || patch.note || patch.tracking_number) {
      await query(
        `INSERT INTO order_events (order_id, event_type, stage, actor_type, actor_id, outcome, notes)
         VALUES ($1, $2, $3, 'admin', $4, 'recorded', $5)`,
        [
          current.id,
          patch.note ? "note" : patch.status ? "status_update" : "shipping_update",
          patch.status || current.fulfillment_status || "processing",
          String(actorId),
          patch.note ||
            (patch.status ? `Fulfillment updated to ${patch.status}` : `Tracking updated to ${patch.tracking_number}`),
        ],
      );
    }

    return this.getAdminOrder("product", id);
  }
}
