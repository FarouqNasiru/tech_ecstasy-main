# Payments Backend (Paystack)

This adds a minimal Node/Express backend for verifying Paystack payments and handling webhooks.

## Setup

1. Create `server/.env` with:

```
PAYSTACK_SECRET_KEY=sk_live_xxx
CORS_ORIGIN=https://yourdomain.com,http://localhost:3000
PORT=8080
```

2. Install and run:

```
cd server
npm install
npm run dev
```

Server runs at `http://localhost:8080` by default.

## Endpoints

- `POST /api/payments/paystack/verify`
  - Body: `{ reference: string, expectedAmount?: number, expectedCurrency?: 'NGN' }`
  - Verifies with Paystack Verify API. Returns `{ verified: boolean, data?: any }`.

- `POST /api/payments/paystack/webhook`
  - Configure in Paystack dashboard. Validate signature in production.

## Frontend Integration (cart.js)

After Paystack popup success callback, call the verify endpoint before completing the order:

```js
// inside callback
const totalAmountKobo = calculateTotal(cartItems) * 100;
const verifyRes = await fetch('http://localhost:8080/api/payments/paystack/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reference: response.reference, expectedAmount: totalAmountKobo, expectedCurrency: 'NGN' })
});
const verify = await verifyRes.json();
if (!verify.verified) {
  alert('Payment could not be verified. Please contact support.');
  return;
}
// proceed to completePurchase(...)
```

## Notes

- Keep `PAYSTACK_SECRET_KEY` only on the server.
- Consider moving `completePurchase` to the backend so order creation is strictly server-verified.
- Add signature validation for webhooks (x-paystack-signature).