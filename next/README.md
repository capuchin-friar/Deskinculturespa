# Deskinculture Spa

Next.js application for products, spa services, and consultation appointments.

## Payment configuration

Payments use Paystack. The secret key is server-side only.

Required environment variables:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
PAYSTACK_CALLBACK_URL=https://your-domain.com/payment/callback
```

`PAYSTACK_CALLBACK_URL` is optional. Payment confirmation does not depend on the browser callback; the Paystack webhook is the source of truth.

Configure the Paystack webhook URL as:

```text
https://your-domain.com/api/payments/paystack/webhook
```

Use the test secret key while testing and the live secret key only when the application is ready for production.

## Checkout APIs

### Products

```http
POST /api/checkout/cart
```

Creates a product order from the authenticated customer's cart, snapshots the order items, creates a local payment transaction, and initializes Paystack. The response contains `authorization_url`, `access_code`, and the internal transaction reference.

### Services

```http
POST /api/checkout/service
Content-Type: application/json

{
  "service_id": 123,
  "scheduled_at": "2026-10-01T10:00:00+01:00",
  "notes": "Optional notes"
}
```

Creates the service booking and its order before initializing Paystack.

### Consultations

```http
POST /api/checkout/appointment
Content-Type: application/json

{
  "offering_id": 123,
  "appointment_date": "2026-10-01",
  "start_time": "10:00",
  "notes": "Optional notes"
}
```

The consultant is resolved from the selected consultation offering on the server. The endpoint checks for an overlapping appointment before creating the order and payment transaction.

### Payment verification

```http
POST /api/payments/verify
Content-Type: application/json

{
  "reference": "dsc_product_123_..."
}
```

The server verifies the transaction directly with Paystack and reconciles it with the local transaction and order.

## Payment lifecycle

```text
Customer
   |
   v
Checkout API
   |
   +--> create order/domain record
   |
   +--> create local transaction (pending)
   |
   +--> Paystack initialize
   |
   v
Paystack Checkout
   |
   +----------------------+
   |                      |
   v                      v
Webhook               Verify API
   |                      |
   +----------+-----------+
              v
      Validate reference
      Validate amount/currency
              |
              v
      transactions = success
      paystack_transactions = recorded
      orders = paid/confirmed
              |
       +------+------+
       |             |
    booking       appointment
     paid/          paid/
    confirmed     confirmed
```

Successful payments are reconciled through the signed Paystack webhook. Webhook processing is idempotent using the local transaction reference and Paystack transaction identifiers. The server also validates the paid amount and currency before marking an order as paid.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Getting Started

The application uses PostgreSQL. Configure the existing database environment variables used by `app/api/lib/database.ts`, then run the SQL migrations in `app/api/migration` in order.
