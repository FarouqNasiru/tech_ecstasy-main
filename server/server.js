import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json());

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY; // sk_live_xxx
if (!PAYSTACK_SECRET) {
  console.warn('PAYSTACK_SECRET_KEY not set. Set it in your .env file.');
}

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Verify transaction by reference (client will call this after Paystack popup success)
app.post('/api/payments/paystack/verify', async (req, res) => {
  try {
    const { reference, expectedAmount, expectedCurrency = 'NGN' } = req.body;
    if (!reference) return res.status(400).json({ error: 'Missing reference' });

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });

    const data = response.data?.data;
    if (!data) return res.status(502).json({ error: 'Invalid verify response' });

    const statusOk = data.status === 'success';
    const currencyOk = !expectedCurrency || data.currency === expectedCurrency;
    const amountOk = !expectedAmount || Number(data.amount) === Number(expectedAmount);

    if (!statusOk || !currencyOk || !amountOk) {
      return res.status(400).json({
        verified: false,
        reason: {
          statusOk,
          currencyOk,
          amountOk,
          got: { status: data.status, currency: data.currency, amount: data.amount }
        }
      });
    }

    // TODO: persist the order in your DB here (e.g., Firestore/SQL) and mark paid

    return res.json({ verified: true, data });
  } catch (err) {
    console.error('Verify error', err.response?.data || err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// Webhook endpoint for Paystack events
app.post('/api/payments/paystack/webhook', express.json({ type: '*/*' }), (req, res) => {
  // NOTE: For stronger security, validate x-paystack-signature header using your secret key.
  try {
    const event = req.body;
    // Handle event types: charge.success, charge.failed, etc.
    if (event?.event === 'charge.success') {
      const ref = event?.data?.reference;
      // TODO: verify again via verify endpoint and mark order paid idempotently
      console.log('Webhook charge.success:', ref);
    }
    res.status(200).json({ received: true });
  } catch (e) {
    console.error('Webhook error', e);
    res.status(400).json({ error: 'Webhook parse error' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));