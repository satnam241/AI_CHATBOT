import { Request, Response } from "express";
import razorpay from "../config/razorpay";
import { PLAN_PRICES } from "../constant/plans";
import { prisma } from "../config/prisma";
import crypto from "crypto";
import { Plan } from "@prisma/client";

export const createOrder = async (req: Request, res: Response) => {

    const user = (req as any).user;
  
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }
  
    const plan = req.body?.plan;
  
    if (!plan) {
      return res.status(400).json({
        message: "Plan is required"
      });
    }
  
    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
  
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR"
    });
  
    await prisma.transaction.create({
      data: {
        userId: user.userId,
        plan,
        amount,
        razorpayId: order.id
      }
    });
  
    res.json({
      orderId: order.id,
      amount
    });
  
  };

export const verifyPayment = async (req: Request, res: Response) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      message: "Payment verification failed"
    });
  }

  /* 1️⃣ Find transaction */
  const transaction = await prisma.transaction.findFirst({
    where: { razorpayId: razorpay_order_id }
  });

  if (!transaction) {
    return res.status(404).json({
      message: "Transaction not found"
    });
  }

  /* 2️⃣ Update transaction */
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: "SUCCESS" }
  });

  /* 3️⃣ Update user plan */
  await prisma.user.update({
    where: { id: transaction.userId },
    data: { plan: transaction.plan }
  });

  res.json({
    message: "Payment successful"
  });

};