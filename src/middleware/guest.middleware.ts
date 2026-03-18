import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const guestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  let guestId = req.headers["x-guest-id"] as string;

  if (!guestId) {
    guestId = uuidv4();
  }

  (req as any).guestId = guestId;

  res.setHeader("x-guest-id", guestId);

  next();
};


//Frontend header store karega: x-guest-id