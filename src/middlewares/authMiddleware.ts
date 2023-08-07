import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    isAdmin: boolean;
  };
}

export const isAuthRequest = (req: Request): req is AuthenticatedRequest => {
  return 'user' in req;
};

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No authentication token. Access denied." });
  }

  try {
    const decoded = jwt.verify(token, "secret-key") as { id: number; isAdmin: boolean };
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid authentication token. Access denied." });
  }
};
