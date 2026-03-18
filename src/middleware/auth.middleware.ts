import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const token = auth.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token missing"
    });
  }

  try {

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_ACCESS_SECRET as string
    );

    (req as any).user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Token expired or invalid"
    });

  }
};