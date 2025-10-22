import type { Request, Response } from "express";
import { getUserById, userLogin } from "./user.services.ts";

export const userLoginHandler = async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await userLogin(email);

  res.json({
    result,
  });
};

export const findReceiverById = async (req: Request, res: Response) => {
  const { receiverId } = req.params;

  const result = await getUserById(receiverId);

  res.json({
    result,
  });
};
