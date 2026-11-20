export function parseSpecifications(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? value : {};
}

export function discountFieldValues(specs) {
  const parsed = parseSpecifications(specs);
  const info =
    parsed?.discount && typeof parsed.discount === "object"
      ? parsed.discount
      : {};
  return {
    discount:
      info.discount != null && info.discount !== ""
        ? String(info.discount)
        : "",
    discountType: String(info.discountType || ""),
  };
}

export function mergeDiscountSpec(specs, discount, discountType) {
  const parsed = parseSpecifications(specs);
  if (discount === "" || discount == null || !discountType) {
    const next = { ...parsed };
    delete next.discount;
    return next;
  }
  return {
    ...parsed,
    discount: {
      discountType,
      discount: Number(discount),
    },
  };
}

export function collectDiscountErrors({ discount, discountType, price }) {
  const errors = {};
  if (discount === "" || discount == null) return errors;
  const amount = Number(discount);
  if (!Number.isFinite(amount) || amount < 0) {
    errors.discount = "Enter a valid discount.";
  } else if (!discountType) {
    errors.discountType = "Please select a discount type.";
  } else if (
    (discountType === "percentage" || discountType === "percent") &&
    amount > 100
  ) {
    errors.discount = "Percentage discount cannot exceed 100%.";
  } else if (
    (discountType === "fixed" || discountType === "amount") &&
    Number(price) > 0 &&
    amount >= Number(price)
  ) {
    errors.discount = "Fixed discount must be less than the price.";
  }
  return errors;
}

export function productPricing(product) {
  const original = Number(product?.price) || 0;
  const specs = parseSpecifications(product?.specifications);
  const info =
    specs?.discount && typeof specs.discount === "object"
      ? specs.discount
      : specs;
  const type = String(info?.discountType || info?.type || "").toLowerCase();
  const amount = Number(info?.discount ?? info?.amount ?? info?.value);
  let sale = original;

  if (Number.isFinite(amount) && amount > 0 && original > 0) {
    if (type === "percentage" || type === "percent") {
      sale = original * (1 - Math.min(amount, 100) / 100);
    } else if (type === "fixed" || type === "amount") {
      sale = original - amount;
    }
  }

  sale = Math.max(0, Math.round(sale * 100) / 100);
  return {
    original,
    sale,
    hasDiscount: sale < original - 0.001,
  };
}
