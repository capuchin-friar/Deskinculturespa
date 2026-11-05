export function formatOrderPrice(value) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatOrderDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function parseShippingAddress(value) {
  if (!value) return "";
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return [parsed.street, parsed.town, parsed.state].filter(Boolean).join(", ");
      }
    } catch {
      return value;
    }
    return value;
  }
  return "";
}

export function parseShippingParts(value) {
  if (!value) return { street: "", town: "", state: "", formatted: "" };
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return {
          street: parsed.street || "",
          town: parsed.town || "",
          state: parsed.state || "",
          formatted: [parsed.street, parsed.town, parsed.state].filter(Boolean).join(", "),
        };
      }
    } catch {
      return { street: value, town: "", state: "", formatted: value };
    }
  }
  return { street: String(value), town: "", state: "", formatted: String(value) };
}

export function orderStatusView(order) {
  const fulfillment = String(order.fulfillment_status || "").toLowerCase();
  const payment = String(order.payment_status || "").toLowerCase();
  if (["cancelled", "canceled"].includes(fulfillment) || payment === "refunded") {
    return { label: "Cancelled", color: "gray", archived: true };
  }
  if (["returned", "return"].includes(fulfillment)) {
    return { label: "Returned", color: "gray", archived: true };
  }
  if (fulfillment === "delivered") {
    return { label: "Delivered", color: "green", archived: false };
  }
  if (fulfillment === "shipped") {
    return { label: "Shipped", color: "blue", archived: false };
  }
  if (payment === "paid") {
    return { label: "Order placed", color: "blue", archived: false };
  }
  return { label: fulfillment || "Processing", color: "blue", archived: false };
}

export function asOrderItems(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapCustomerOrder(order) {
  const items = asOrderItems(order.items);
  const quantity = items.reduce((sum, item) => sum + Number(item.units || 0), 0);
  const names = items.map((item) => item.name).filter(Boolean);
  const title =
    names.length === 0
      ? "Order"
      : names.length === 1
        ? names[0]
        : `${names[0]} + ${names.length - 1} more`;
  const status = orderStatusView(order);
  const placedOn = formatOrderDate(order.created_at);
  const deliveryDate = formatOrderDate(order.estimated_delivery_date);
  const shipping = parseShippingParts(order.shipping_address);
  return {
    id: order.id,
    title,
    quantity,
    thumbnail: items[0]?.thumbnail_url || "",
    items,
    status: status.label,
    color: status.color,
    archived: status.archived,
    delivery: deliveryDate
      ? `Estimated delivery ${deliveryDate}`
      : placedOn
        ? `Placed on ${placedOn}`
        : "We’re preparing your order.",
    details: status.archived
      ? `This order is ${status.label.toLowerCase()}.`
      : "Your order has been received and is being processed.",
    total: order.total_paid,
    amountPaid: order.amount_paid,
    shippingFee: order.shipping_fee,
    tax: order.tax,
    charges: order.charges,
    currency: order.currency || "NGN",
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
    shippingMethod: order.shipping_method,
    trackingNumber: order.tracking_number,
    logisticProvider: order.logistic_provider,
    estimatedDelivery: deliveryDate,
    placedOn,
    createdAt: order.created_at,
    reference: order.payment_reference,
    address: shipping.formatted,
    shipping,
  };
}
