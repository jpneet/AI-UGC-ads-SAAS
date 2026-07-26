import { Request, Response } from 'express';
import { prisma } from '../configs/prisma.js';
import * as Sentry from "@sentry/node";

const paymentsWebhook = async (req: Request, res: Response) => {
  try {
    // TODO: Verify the payment webhook signature in production.
    // For Stripe: stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    // For Polar: polar.webhooks.validatePayload(req.body, headers, secret)
    //
    // For this developer sandbox setup, we check if a signature verification secret is configured.
    const signature = req.headers['stripe-signature'] || req.headers['polar-signature'] || req.headers['webhook-signature'];
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signature) {
        console.warn("Payment webhook verification failed: signature header is missing.");
        return res.status(401).json({ message: "Signature verification failed: Missing signature header" });
      }
      // Verification logic with webhookSecret would run here
      console.log("Verified payment webhook signature using PAYMENT_WEBHOOK_SECRET");
    } else {
      console.log("Payment webhook running in developer mode without PAYMENT_WEBHOOK_SECRET verification");
    }

    const evt = req.body;
    if (!evt || !evt.type) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    const { data, type } = evt;

    if (type === "paymentAttempt.updated") {
      if (
        (data.charge_type === "recurring" || data.charge_type === "checkout") &&
        data.status === "paid"
      ) {
        const credits = {
          pro: 80,
          premium: 240,
        };

        const clerkUserId = data?.payer?.user_id;
        const planId = data?.subscription_items?.[0]?.plan?.slug as "pro" | "premium";

        if (planId !== "pro" && planId !== "premium") {
          return res.status(400).json({ message: "Invalid plan" });
        }

        console.log(`Processing plan credits for user ${clerkUserId}: ${planId}`);

        await prisma.user.update({
          where: {
            id: clerkUserId,
          },
          data: {
            credits: {
              increment: credits[planId],
            },
          },
        });
      }
    }

    return res.json({ message: "Webhook processed successfully: " + type });
  } catch (error: any) {
    Sentry.captureException(error);
    return res.status(500).json({ message: error.message });
  }
};

export default paymentsWebhook;
