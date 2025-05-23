const { validationResult } = require('express-validator');
const randtoken = require('rand-token');
const Sms = require('../../services/smsService');
const ccavanue = require('../../utils/ccavanue');
const jtfd = require('json-to-form-data');
const { payment_url, merchant_id, accessCode, workingKey } = require('../../config/payment');
const { baseUrl, clientUrl } = require('../../config/index');
const Payment = require('../../models/Payment');
const url = require('url');

exports.generatePayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  let payment;
  try {
    payment = new Payment({
      "name": req.body.name,
      "amount": req.body.amount
    });
    const paymentId = randtoken.generate(16);
    payment.payment_id = paymentId;
    await payment.save();
  } catch (err) {
    return next(err);
  }
  payment = payment.toObject();
  delete payment._id;
  return res.json({
    data: {
      payment_id: payment.payment_id
    }
  });
}

// Process payment
exports.processPayment = async (req, res, next) => {
  if (!req.params.id) {
    return next({ statusCode: 400, message: 'Payment Id is required' });
  }
  try {
    const data = await Payment.findOne({ payment_id: req.params.id });
    if (!data) {
      return next({ statusCode: 422, message: 'Payment is not complete. Please try again.' });
    }
    const createdAt = new Date(data.created_at).getTime();
    const expiry = createdAt + 30 * 24 * 60 * 60 * 1000;
    if (Date.now() > expiry) {
      return next({ statusCode: 422, message: 'Payment link expired. Please try again.' });
    }

    if (data.payment_response?.order_status === 'Success') {
      return next({ statusCode: 422, message: 'Payment is already done.' });
    }

    const payload = {
      merchant_id,
      order_id: data.payment_id,
      currency: 'INR',
      billing_name: data.name,
      billing_email: '',
      billing_tel: '',
      amount: data.amount,
      redirect_url: `${baseUrl}/api/admin/payment-response`,
      cancel_url: `${baseUrl}/api/admin/payment-response`,
      language: 'EN',
    };
    
    console.log(payload);
   
     const formDataString = jtfd(payload);
   
     const encRequest = ccavanue.encrypt(formDataString, workingKey);
   
     // const formbody = '<form id="nonseamless" method="post" name="redirect" action="' + payment_url + '"/> <input type="hidden" id="encRequest" name="encRequest" value="' + encRequest + '"><input type="hidden" name="access_code" id="access_code" value="' + accessCode + '"><script language="javascript">document.redirect.submit();</script></form>';
     const formbody = `
     <form id="nonseamless" method="post" name="redirect" action="${payment_url}">
       <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
       <input type="hidden" name="access_code" id="access_code" value="${accessCode}">
       <script language="javascript">
         document.redirect.submit();
       </script>
     </form>
   `;
     console.log(formbody);
     res.send(formbody);
   
  } catch (err) {
    return next(err);
  }
}

// Handle payment response
exports.paymentResponseHandler = async (req, res, next) => {
  const { orderNo, encResp } = req.body;

  if (!orderNo) {
    return next({ statusCode: 500, message: 'OrderNo missing from payment_response from ccavanue.' });
  }

  try {
    const dataObj = await Payment.findOne({ payment_id: orderNo });
    if (!dataObj) {
      return next({ statusCode: 500, message: 'Invalid OrderNo, cannot find any transaction with this order no' });
    }

    const paymentData = ccavanue.decrypt(encResp, workingKey);
    const queryStrings = url.parse('/?' + paymentData, true).query;
    dataObj.payment_response = queryStrings;

    if (dataObj.status === 4) {
      return res.status(422).json({ message: 'Payment already done' });
    }

    if (queryStrings.order_status === 'Success') {
      dataObj.status = 4;
      dataObj.payment_date = new Date().toISOString();
      await dataObj.save();

      const smsAdmin = `Hello Admin, new payment received. payment_id: ${dataObj.payment_id}, name: ${dataObj.name}, Amount: ${dataObj.amount}`;
      try {
        await Sms.send('917678105666', smsAdmin);
      } catch (err) {
        console.error('Failed to send the SMS', err);
      }

      res.redirect(`${clientUrl}`);
    } else {
      dataObj.status = 6;
      await dataObj.save();
      res.json({ message: 'Payment failed' });
    }
  } catch (err) {
    next(err);
  }
};

// Retrieve all successful payments
exports.allPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: 4 }).sort('-created_at');
    res.json({ status: 200, data: payments });
  } catch (err) {
    next(err);
  }
};

// Retrieve payment status
exports.paymentStatus = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(422).json({ message: 'Invalid payment id' });
  }

  try {
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ status: 200, data: payment });
  } catch (err) {
    next(err);
  }
};
