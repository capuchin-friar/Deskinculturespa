"use client";

export function DiscountFields({
  discount,
  discountType,
  errors = {},
  onDiscountChange,
  onTypeChange,
}) {
  return (
    <div className="pricing-row">
      <div className="form-group">
        <label htmlFor="offer-discount">Discount</label>
        <input
          id="offer-discount"
          type="number"
          min="0"
          value={discount}
          onChange={(event) => onDiscountChange(event.target.value)}
          className={errors.discount ? "input-error" : ""}
        />
        {errors.discount ? <p className="error-message">{errors.discount}</p> : null}
      </div>
      <div className="form-group">
        <label htmlFor="offer-discount-type">&nbsp;</label>
        <select
          id="offer-discount-type"
          value={discountType}
          onChange={(event) => onTypeChange(event.target.value)}
          className={errors.discountType ? "input-error" : ""}
        >
          <option value="" disabled>
            Select a discount type
          </option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
        {errors.discountType ? (
          <p className="error-message">{errors.discountType}</p>
        ) : null}
      </div>
    </div>
  );
}
