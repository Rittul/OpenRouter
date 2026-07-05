const express = require("express");
const paymentRouter = express.Router();
const prisma = require("../config/prisma");
const userauth = require("../middleware/auth");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
paymentRouter.post("/order", userauth, async (req, res) => {
  try {
    const userid = req.user;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount specified." });
    }

    const amountInCents = Math.round(Number(amount) * 100);

    const origin = req.headers.origin || "";
    const clientUrl = (origin.includes("localhost") || origin.includes("127.0.0.1"))
      ? origin
      : (process.env.CLIENT_URL || "http://localhost:5173");

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "OpenRouter AI Gateway Tokens",
              description: `Top up account balance with tokens`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${clientUrl}/credits?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/credits`,
      metadata: {
        userId: userid.toString(),
        amount: amount.toString(),
      },
    });

    // Create a pending transaction record
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userid,
        type: "credit",
        amount: Number(amount),
        status: "pending",
        provider: "stripe",
        provider_txn_id: session.id,
      },
    });

    return res.json({
      url: session.url,
      transactionId: transaction.id,
    });
  } catch (err) {
    console.error("Stripe Session Creation Error:", err);
    return res.status(500).json({ message: "Failed to initiate Stripe Checkout Session." });
  }
});

// Verify Stripe Checkout Session
paymentRouter.post("/verify", userauth, async (req, res) => {
  try {
    const userid = req.user;
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID is required." });
    }

    // Retrieve the checkout session from Stripe to verify status
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({ message: "Stripe session not found." });
    }

    // Find the corresponding pending transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        provider_txn_id: session_id,
        user_id: userid,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction record not found." });
    }

    // Return the balance if the payment has already been credited (idempotency)
    if (transaction.status === "success") {
      const credit = await prisma.credit.findUnique({
        where: { user_id: userid },
      });
      return res.json({
        message: "Payment already verified",
        balance: credit.balance,
      });
    }

    // Verify Stripe payment success status
    if (session.payment_status === "paid") {
      const [updatedTransaction, updatedCredit] = await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "success",
            provider_txn_id: session.payment_intent || session.id,
          },
        }),
        prisma.credit.update({
          where: { user_id: userid },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        }),
      ]);

      return res.json({
        message: "Stripe payment verified successfully",
        balance: updatedCredit.balance,
      });
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "failed",
        },
      });
      return res.status(400).json({ message: "Payment session unpaid or failed." });
    }
  } catch (err) {
    console.error("Stripe Session Verification Error:", err);
    return res.status(500).json({ message: "Failed to verify Stripe payment." });
  }
});

module.exports = paymentRouter;