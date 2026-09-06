import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactsRouter from "./contacts.js";
import adminRouter from "./admin.js";
import paypalRouter from "./paypal.js";
import plansRouter from "./plans.js";
import userRouter from "./user.js";
import clientUpdatesRouter from "./clientUpdates.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactsRouter);
router.use(adminRouter);
router.use(paypalRouter);
router.use(plansRouter);
router.use(userRouter);
router.use(clientUpdatesRouter);

export default router;
