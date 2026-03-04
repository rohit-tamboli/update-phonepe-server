import { newPayment, checkStatus } from "../../controller/phonepe/paymentController.js";
import express from "express";
const router = express.Router();
import Payment from "../../models/Payment.js";

router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments" });
  }
});

router.post('/payment', newPayment);
router.post('/status/:txnId', checkStatus);

export default router;