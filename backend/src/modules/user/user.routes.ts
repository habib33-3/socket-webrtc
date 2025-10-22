import { Router } from "express";
import { findReceiverById, userLoginHandler } from "./user.controllers.ts";

const router = Router();

router.post("/", userLoginHandler);
router.get("/:receiverId",findReceiverById)

export const userRouter = router;
