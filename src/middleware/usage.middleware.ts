import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { PLAN_LIMITS } from "../constant/plans";

export const checkUsageLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId }
    });

    if (!dbUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const today = new Date().toDateString();
    const lastUsed = dbUser.lastUsedAt
      ? new Date(dbUser.lastUsedAt).toDateString()
      : null;

    let usage = dbUser.dailyUsage;

    /* Reset daily usage */
    if (today !== lastUsed) {
      usage = 0;
    }

    const limit = PLAN_LIMITS[dbUser.plan];

    if (usage >= limit) {
      return res.status(403).json({
        message: "Daily usage limit exceeded. Upgrade your plan."
      });
    }

    /* Increment usage */
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        dailyUsage: usage + 1,
        lastUsedAt: new Date()
      }
    });

    next();

  } catch (error) {

    res.status(500).json({
      message: "Usage check failed"
    });

  }
};