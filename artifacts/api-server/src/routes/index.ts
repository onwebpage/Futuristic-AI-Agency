import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactsRouter from "./contacts.js";
import adminRouter from "./admin.js";
import paypalRouter from "./paypal.js";
import plansRouter from "./plans.js";
import userRouter from "./user.js";
import clientUpdatesRouter from "./clientUpdates.js";
import ticketsRouter from "./tickets.js";
import projectsRouter from "./projects.js";
import documentsCommunicationRouter from "./documentsCommunication.js";
import meetingsRouter from "./meetings.js";
import billingRouter from "./billing.js";
import partnerRouter from "./partner.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactsRouter);
router.use(adminRouter);
router.use(paypalRouter);
router.use(plansRouter);
router.use(userRouter);
router.use(clientUpdatesRouter);
router.use(ticketsRouter);
router.use(projectsRouter);
router.use(documentsCommunicationRouter);
router.use(meetingsRouter);
router.use(billingRouter);
router.use(partnerRouter);

export default router;
