const stripe = require('../config/stripe');

/** Create a PaymentIntent for an order */
const createPaymentIntent = async ({ amount, customerId, metadata }) => {
  const params = {
    amount,
    currency: 'usd',
    capture_method: 'automatic',
    metadata,
  };
  if (customerId) params.customer = customerId;
  return stripe.paymentIntents.create(params);
};

/** Cancel a PaymentIntent (before capture) */
const cancelPaymentIntent = async (paymentIntentId) =>
  stripe.paymentIntents.cancel(paymentIntentId);

/** Issue a full or partial refund */
const refundPayment = async (paymentIntentId, amount) => {
  const params = { payment_intent: paymentIntentId };
  if (amount) params.amount = amount;
  return stripe.refunds.create(params);
};

/** Transfer driver earnings via Stripe Connect */
const transferToDriver = async ({ amount, stripeAccountId, orderId }) =>
  stripe.transfers.create({
    amount,
    currency: 'usd',
    destination: stripeAccountId,
    transfer_group: String(orderId),
  });

/** Start Stripe Connect Express onboarding for a driver */
const createConnectAccount = async (email) =>
  stripe.accounts.create({ type: 'express', email });

const createAccountLink = async (accountId, refreshUrl, returnUrl) =>
  stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

/** Create or retrieve a Stripe Customer */
const getOrCreateCustomer = async (user) => {
  if (user.stripeCustomerId) return { id: user.stripeCustomerId };
  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    metadata: { userId: String(user._id) },
  });
  user.stripeCustomerId = customer.id;
  await user.save();
  return customer;
};

module.exports = {
  createPaymentIntent,
  cancelPaymentIntent,
  refundPayment,
  transferToDriver,
  createConnectAccount,
  createAccountLink,
  getOrCreateCustomer,
};
