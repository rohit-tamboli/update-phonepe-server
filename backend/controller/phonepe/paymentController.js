import crypto from "crypto";
import axios from "axios";
import Payment from "../../models/Payment.js";

const newPayment = async (req, res) => {
  const merchant_id = process.env.MERCHANT_ID;
  const salt_key = process.env.SALT_KEY;
  const keyIndex = process.env.SALT_INDEX;

  console.log("KEY INDEX:", keyIndex); // debug once

  console.log("Payment API Hit ✅");

  try {
    const merchantTransactionId = req.body.transactionId;

    console.log("Saving to MongoDB...");

    // 🔹 Save payment as PENDING in MongoDB
    await Payment.create({
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.MUID,
      name: req.body.name,
      email: req.body.email, // ✅ added
      role: req.body.role, // ✅ added
      mobileNumber: req.body.number,
      amount: req.body.amount,
      status: "PENDING",
    });

    const data = {
      merchantId: merchant_id,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.MUID,
      name: req.body.name,
      amount: req.body.amount * 100,
      redirectUrl: `${process.env.BASE_URL}/api/status/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: req.body.number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL =
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        return res.json({
          url: response.data.data.instrumentResponse.redirectInfo.url,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

const checkStatus = async (req, res) => {
  try {
    const merchantTransactionId = req.params.txnId;
    const merchantId = merchant_id;
    const keyIndex = process.env.SALT_INDEX;

    const string =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;

    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const response = await axios.get(
      `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchantId,
        },
      }
    );

    // ✅ Payment Success
    if (response.data.success === true) {
      await Payment.findOneAndUpdate(
        { merchantTransactionId },
        { status: "SUCCESS" }
      );

      return res.redirect(`${process.env.FRONTEND_URL}/success`);
    }

    // ❌ Payment Failed
    await Payment.findOneAndUpdate(
      { merchantTransactionId },
      { status: "FAILED" }
    );

    return res.redirect(`${process.env.FRONTEND_URL}/failure`);
  } catch (error) {
    console.error(error.response?.data || error.message);

    await Payment.findOneAndUpdate(
      { merchantTransactionId: req.params.txnId },
      { status: "FAILED" }
    );

    return res.redirect(`${process.env.FRONTEND_URL}/failure`);
  }
};

export { newPayment, checkStatus };
