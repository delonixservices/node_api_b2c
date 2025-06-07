const url = require('url');
const axios = require('axios');
const Api = require('../../services/apiService');
const Transaction = require('../../models/HotelTransaction');
const Mail = require('../../services/mailService');
const ConfigModel = require('../../models/Config');
const logger = require('../../config/logger');


const {
  generateInvoice
} = require('../../utils/invoice');


const {
  generateVoucher
} = require('../../utils/voucher');


const ccavanue = require('../../utils/ccavanue');
const jtfd = require('json-to-form-data');


const {
  accessCode,
  workingKey
} = require('../../config/payment');




exports.allTransactions = async (req, res, next) => {
  const data = await Transaction.find({}).sort({
    created_at: -1
  });


  // Status
  // 0  initial state
  // 1  booking success
  // 2  booking cancelled
  // 3  payment pending
  // 4  payment success
  // 5  booking failed
  // 6  payment failed
  // 7  payment refunded


  const getStatus = ["pending", "success", "cancelled", "payment_pending", "payment_success", "booking_failed", "payment_failed", "refunded"];


  const allTransactions = [];


  data.forEach((trans) => {
    let base_amount, service_charges, processing_fee, gst, chargeable_rate;


    // for old transactions
    if (trans.pricing) {
      base_amount = trans.pricing.base_amount_discount_included;
      chargeable_rate = trans.pricing.total_chargeable_amount;
      service_charges = trans.pricing.service_charges || 0;
      processing_fee = trans.pricing.processing_fee || 0;
      gst = trans.pricing.gst || 0;
    } else {
      base_amount = trans.prebook_response.data.package.chargeable_rate;
      chargeable_rate = trans.prebook_response.data.package.chargeable_rate;
      service_charges = 0;
      processing_fee = 0;
      gst = 0;
    }


    const newTrans = {
      'id': trans._id,
      'hotelName': trans.hotel.name,
      'createdAt': trans.created_at,
      'check_in_date': trans.prebook_response.data.package.check_in_date,
      'check_out_date': trans.prebook_response.data.package.check_out_date,
      'room_count': trans.prebook_response.data.package.room_count,
      'first_name': trans.contactDetail.name,
      'last_name': trans.contactDetail.last_name,
      'coupon_used': trans.coupon.code ? trans.coupon.code : "-",
      'base_amount': Math.round(base_amount * 100) / 100,
      'service_charges': Math.round(service_charges * 100) / 100,
      'processing_fee': Math.round(processing_fee * 100) / 100,
      'gst': Math.round(gst * 100) / 100,
      'chargeable_rate': Math.round(chargeable_rate * 100) / 100,
      'transaction_status': getStatus[trans.status]
    }


    allTransactions.push(newTrans);
  });


  res.json({
    "status": 200,
    "data": allTransactions
  });
};


exports.getInvoice = async (req, res, next) => {
  const transactionId = req.query.transactionId;
  const transaction = await Transaction.findById(transactionId);


  if (!transaction) {
    return res.status(404).send('Invalid transactionId');
  }


  if (transaction.status != 1) {
    return res.status(422).json({
      'message': 'Cannot get invoice for incomplete transaction'
    });
  }


  let buffer;
  try {
    buffer = await generateInvoice(transaction);
  } catch (err) {
    console.log('Cannot get voucher for the given transaction');
    console.log(err);


    return res.status(422).json({
      'message': 'Cannot get voucher for the given transaction'
    });
  }


  res.header('Content-type', 'application/pdf');
  res.send(buffer);
}


exports.getVoucher = async (req, res, next) => {
  const transactionId = req.query.transactionId;


  const transaction = await Transaction.findById(transactionId);


  if (!transaction) {
    return res.status(404).send('Invalid transactionId');
  }


  if (transaction.status != 1) {
    return res.status(422).json({
      'message': 'Cannot get voucher for incomplete transaction'
    });
  }


  let buffer;
  try {
    buffer = await generateVoucher(transaction);
  } catch (err) {
    console.log('Cannot get voucher for the given transaction');
    console.log(err);


    return res.status(422).json({
      'message': 'Cannot get voucher for the given transaction'
    });
  }


  res.header('Content-type', 'application/pdf');


  res.send(buffer);
}




exports.sendVoucherInvoice = async (req, res, next) => {


  const transactionId = req.body.transactionId;


  let toEmail = req.body.email;


  let transaction;
  try {
    transaction = await Transaction.findById(transactionId);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      'message': 'Cannot find any transaction by this transaction id'
    });
  }


  // if no email provided sent the email to the registered email of the user
  if (!toEmail) {
    toEmail = transaction.contactDetail.email;
  }


  let invoiceBuffer = await generateInvoice(transaction);
  invoiceBuffer = invoiceBuffer.toString('base64');
  let voucherBuffer = await generateVoucher(transaction);
  voucherBuffer = voucherBuffer.toString('base64');


  const msg = {
    to: toEmail,
    subject: 'TripBazaar Confim Ticket',
    text: `Dear ${transaction.contactDetail.name}, Your Hotel ${transaction.hotel.originalName} has been booked and the bookingId is ${transactionId}. Thank you !`,
    attachments: [{
      filename: 'Invoice.pdf',
      content: invoiceBuffer,
      type: 'application/pdf',
      disposition: 'attachment',
      contentId: 'myId'
    }, {
      filename: 'Voucher.pdf',
      content: voucherBuffer,
      type: 'application/pdf',
      disposition: 'attachment',
      contentId: 'myId'
    }],
    html: `Dear ${transaction.contactDetail.name}, Your Hotel ${transaction.hotel.originalName} has been booked and the booking reference no. is ${transactionId}. Thank you !`,
  };


  try {
    Mail.send(msg);


    res.json({
      'message': 'Invoice and Voucher sent to the mail successfully'
    })
  } catch (err) {
    console.log("Failed to send mail", err);
  }
}




exports.orderStatus = async (req, res) => {
  const transactionId = req.body.transactionId;
  const transaction = await Transaction.findOne({
    "_id": transactionId
  });
  if (!transaction) {
    return res.status(404).json({
      message: "Invalid transaction id, please try again"
    });
  }
  const payload = {
    'reference_no': transaction.payment_response.tracking_id,
    "order_no": transaction.payment_response.order_id
  }
  const payloadString = JSON.stringify(payload);
  const enc_data = ccavanue.encrypt(payloadString, workingKey);
  const requestBody = {
    'enc_request': enc_data,
    'access_code': accessCode,
    'request_type': 'JSON',
    'response_type': 'JSON',
    'command': 'orderStatusTracker',
    'reference_no': transaction.payment_response.tracking_id,
    'order_no': transaction.payment_response.order_id,
    'version': '1.2'
  };
  console.log(payload);


  const requestBodyString = jtfd(requestBody);
  logger.info('Refund Order...');
  logger.info(requestBodyString);
  console.log(requestBodyString);
  const resData = await Api.post('https://apitest.ccavenue.com/apis/servlet/DoWebTrans', requestBodyString);
  logger.info(resData);
  const parsedResponse = url.parse("/?" + resData, true).query;
  logger.info('OrderStatus Response...');
  console.log(parsedResponse);
  if (parsedResponse.status != 0) {
    return res.status(400).json({
      'status': 'failed',
      'message': 'Unable to process the request.'
    });
  }
  const decryptResponse = ccavanue.decrypt(parsedResponse.enc_response, workingKey);
  const decryptResponseObj = JSON.parse(decryptResponse);
  logger.info('Decrypted Response...');
  console.log(decryptResponseObj);
  // if (decryptResponseObj.refund_status !== 0) {
  //   return res.json({
  //     'status': 'failed',
  //     'message': 'Cannot complete order status request for the given order. Order Status request failed.'
  //   });
  // }
  res.json({
    'status': 'success',
    'data': decryptResponseObj
  });


  await transaction.save();
}


exports.orderConfirm = async (req, res) => {


  const transactionId = req.body.transactionId;


  const transaction = await Transaction.findOne({
    "_id": transactionId
  });


  if (!transaction) {
    return res.status(404).json({
      message: "Invalid transaction id, please try again"
    });
  }


  const payload = {
    "order_List": [{
      'reference_no': transaction.payment_response.tracking_id,
      'amount': transaction.payment_response.amount,
    }]
  }


  const payloadString = JSON.stringify(payload);


  const enc_data = ccavanue.encrypt(payloadString, workingKey);


  const requestBody = {
    'enc_request': enc_data,
    'access_code': accessCode,
    'request_type': 'JSON',
    'response_type': 'JSON',
    'command': 'confirmOrder',
    'reference_no': transaction.payment_response.tracking_id,
    'amount': transaction.payment_response.amount,
    'version': '1.1'
  };


  logger.info(payload);


  const requestBodyString = jtfd(requestBody);
  logger.info('Confirm Order...');
  logger.info(requestBodyString);


  const resData = await Api.post('https://apitest.ccavenue.com/apis/servlet/DoWebTrans', requestBodyString);


  logger.info(resData);


  const parsedResponse = url.parse("/?" + resData, true).query;


  logger.info('Order Confirm Response...');
  // logger.info(parsedResponse);
  console.log(parsedResponse);


  if (parsedResponse.status != 0) {
    return res.status(400).json({
      'status': 'failed',
      'message': 'Unable to process the request.'
    });
  }


  const decryptResponse = ccavanue.decrypt(parsedResponse.enc_response, workingKey);


  const decryptResponseObj = JSON.parse(decryptResponse);


  logger.info('Decrypted Response...');
  console.log(decryptResponseObj);


  // if (decryptResponseObj.refund_status !== 0) {
  //   return res.json({
  //     'status': 'refund failed',
  //     'message': 'Cannot initiate refund request for the given order. Refund request failed.'
  //   });
  // }


  res.json({
    'status': 'success',
    'data': decryptResponseObj
  });
}


// exports.getpaymentoption = async(req,res)=>{
//   const userid = req.userid;
//   const user_id = await userid.findOne({
//     "userid": id
//   });
//   if (!id) {
//     return res.status(404).json({
//       message: "Invalid id, please try again"
//     });
//   }
//  const payload = {
//     customer_id : transaction.payment_response.userId
//   }
//  const payloadString = JSON.stringify(payload);
//   const enc_data = ccavanue.encrypt(payloadString, workingKey);
//   const requestBody = {
//     'enc_request': enc_data,
//     'access_code': accessCode,
//     'request_type': 'JSON',
//     'response_type': 'JSON',
//     'command': 'getCustomerPaymentOptions',
//     'customer_id' :transaction.payment_response.userId,
//     'version': '1.1'
//   };
//   logger.info(payload);
//   const requestBodyString = jtfd(requestBody);
//   logger.info(requestBodyString);
//   const resData = await Api.post('https://apitest.ccavenue.com/apis/servlet/DoWebTrans', requestBodyString);
//   const parsedResponse = url.parse("/?" + resData, true).query;
//   logger.info('User Payment Option Getting');
//   // logger.info(parsedResponse);
//   console.log(parsedResponse);


//   if (parsedResponse.status != 0) {
//     return res.status(400).json({
//       'status': 'failed',
//       'message': 'Unable to process the request.'
//     });
//   }
//   const decryptResponse = ccavanue.decrypt(parsedResponse.enc_response, workingKey);
//   const decryptResponseObj = JSON.parse(decryptResponse);
//   logger.info('Decrypted Response...');
//   console.log(decryptResponseObj);
//   res.json({
//     'status': 'success',
//     'data': decryptResponseObj
//   });
// }


exports.processRefund = async (req, res) => {
  try {
    const transactionId = req.body.transactionId;


    // Validate transactionId
    if (!transactionId || !require('mongoose').Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid transaction ID format',
      });
    }


    const transaction = await Transaction.findOne({ _id: transactionId });
    if (!transaction) {
      return res.status(404).json({
        message: "Invalid transaction id, please try again"
      });
    }


    // Check if transaction is already refunded
    if (transaction.status === 7 || transaction.refunded) {
      return res.status(400).json({
        status: 'failed',
        message: 'Refund has already been processed for this transaction.',
      });
    }


    // Fetch the latest config for refund calculation
    const config = await ConfigModel.findOne().sort({ updated_at: -1 });
    if (!config) {
      return res.status(500).json({
        status: 'failed',
        message: 'Configuration not found in the database',
      });
    }


    // Calculate custom refund amount
    const calculateRefund = (transaction, config) => {
      const amount = transaction.pricing.total_chargeable_amount;
      const gst = transaction.pricing.gst || 0;
      const processingFee = transaction.pricing.processing_fee || config.processing_fee || 0;
      const serviceCharge = transaction.pricing.service_charges || config.service_charge.value || 0;


      logger.info('Processing refund for transaction:', { amount, gst, processingFee, serviceCharge });


      let cancelCharge = 0;
      const cancelChargeconfig = config.cancellation_charge;
      if (cancelChargeconfig.type === 'percentage') {
        cancelCharge = (amount * cancelChargeconfig.value) / 100;
      } else if (cancelChargeconfig.type === 'fixed') {
        cancelCharge = cancelChargeconfig.value;
      }


      const refundAmount = amount - gst - processingFee - serviceCharge - cancelCharge;
      logger.info('Calculated Refund Amount:', { refundAmount });


      return {
        refundAmount,
        details: {
          amount,
          gst,
          processingFee,
          serviceCharge,
          cancelCharge,
        },
      };
    };


    const { refundAmount, details } = calculateRefund(transaction, config);


    if (refundAmount <= 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Refund amount is invalid or zero.',
      });
    }


    const payload = {
      "reference_no": transaction.payment_response.tracking_id,
      "refund_amount": refundAmount,
      "refund_ref_no": transaction.payment_response.order_id,
    };


    logger.info('Preparing refund payload:', payload);
    const payloadString = JSON.stringify(payload);
    const enc_data = ccavanue.encrypt(payloadString, workingKey);


    const requestBody = {
      'enc_request': enc_data,
      'access_code': accessCode,
      'request_type': 'JSON',
      'response_type': 'JSON',
      'command': 'refundOrder',
      'reference_no': transaction.payment_response.tracking_id,
      'refund_amount': refundAmount,
      "refund_ref_no": transaction.payment_response.order_id,
      'version': '1.1'
    };


    logger.info('Sending refund request to CCAvenue:', { requestBody });
    const requestBodyString = jtfd(requestBody);


    // Log refund attempt
    transaction.refund_attempts = transaction.refund_attempts || [];
    transaction.refund_attempts.push({
      refund_ref_no: transaction.payment_response.order_id,
      refund_amount: refundAmount,
      refund_details: details,
      timestamp: new Date(),
      status: 'pending',
    });
    await transaction.save();


    // Call CCAvenue refund API
    let resData;
    try {
      resData = await Api.post('https://apitest.ccavenue.com/apis/servlet/DoWebTrans', requestBodyString);
    } catch (apiError) {
      logger.error('CCAvenue API request failed:', {
        error: apiError.message,
        status: apiError.response?.status,
        data: apiError.response?.data,
      });
      return res.status(500).json({
        status: 'failed',
        message: 'Failed to communicate with CCAvenue API.',
        error: apiError.message,
      });
    }


    logger.info('Raw CCAvenue API Response:', { data: resData });
    const parsedResponse = url.parse("/?" + resData, true).query;
    logger.info('OrderRefund Response:', parsedResponse);


    if (parsedResponse.status != 0) {
      return res.status(400).json({
        'status': 'failed',
        'message': 'Unable to process the request.'
      });
    }


    const decryptResponse = ccavanue.decrypt(parsedResponse.enc_response, workingKey);
    const decryptResponseObj = JSON.parse(decryptResponse);
    logger.info('Decrypted Response:', decryptResponseObj);


    // Update refund attempt status
    const refundAttempt = transaction.refund_attempts[transaction.refund_attempts.length - 1];
    refundAttempt.status = decryptResponseObj.refund_status === 0 ? 'success' : 'failed';
    refundAttempt.response = decryptResponseObj;


    if (decryptResponseObj.refund_status !== 0) {
      logger.error('Refund request failed:', { decryptResponseObj });
      await transaction.save();
      return res.status(400).json({
        'status': 'refund failed',
        'message': 'Cannot initiate refund request for the given order. Refund request failed.',
        'error': decryptResponseObj.error_desc || 'Unknown error'
      });
    }


    // Update transaction status
    transaction.status = 7; // refunded
    transaction.refunded = true;
    transaction.refund_response = decryptResponseObj;
    await transaction.save();


    // Log changes to config changeHistory
    await ConfigModel.findByIdAndUpdate(
      config._id,
      {
        $push: {
          changeHistory: {
            changedBy: {
              ip: req.ip,
              userId: req.user?._id || null,
            },
            changes: {
              refundProcessed: {
                transactionId,
                refundAmount,
                details,
              },
            },
          },
        },
      },
      { new: true }
    );


    return res.json({
      'status': 'success',
      'message': `Refund of ₹${refundAmount.toFixed(2)} has been processed successfully`,
      'data': {
        refundAmount: refundAmount.toFixed(2),
        refundDetails: {
          originalAmount: details.amount.toFixed(2),
          gst: details.gst.toFixed(2),
          processingFee: details.processingFee.toFixed(2),
          serviceCharge: details.serviceCharge.toFixed(2),
          cancellationCharge: details.cancelCharge.toFixed(2),
          netRefundAmount: refundAmount.toFixed(2)
        },
        transactionId: transactionId,
        hotelName: transaction.hotel.name,
        bookingReference: transaction.payment_response.order_id,
        refundResponse: decryptResponseObj
      }
    });


  } catch (error) {
    logger.error('Error processing refund:', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      status: 'failed',
      message: 'An error occurred while processing the refund.',
      error: error.message,
    });
  }
};


exports.refundamountcheck = async (req, res) => {
  try {
    const transactionId = req.body.transactionId;
    // Validate transactionId
    if (!transactionId || !require('mongoose').Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid transaction ID format',
      });
    }
    const transaction = await Transaction.findOne({ _id: transactionId });
    if (!transaction) {
      return res.status(404).json({
        message: "Invalid transaction id, please try again"
      });
    }


    // Check if transaction is already refunded
    if (transaction.status === 7 || transaction.refunded) {
      return res.status(400).json({
        status: 'failed',
        message: 'Refund has already been processed for this transaction.',
      });
    }


    // Fetch the latest config for refund calculation
    const config = await ConfigModel.findOne().sort({ updated_at: -1 });
    if (!config) {
      return res.status(500).json({
        status: 'failed',
        message: 'Configuration not found in the database',
      });
    }
      const amount = transaction.pricing.total_chargeable_amount;
      const baseamount = transaction.prebook.data
      const gst = transaction.pricing.gst || 0;
      // const processingFee = transaction.pricing.processing_fee || config.processing_fee || 0;
      // const serviceCharge = transaction.pricing.service_charges || config.service_charge.value || 0;
      logger.info('Processing refund for transaction:', { amount, gst, processingFee, serviceCharge });


      let cancelCharge = 0;
      const cancelChargeconfig = config.cancellation_charge;
      if (cancelChargeconfig.type === 'percentage') {
        cancelCharge = (amount * cancelChargeconfig.value) / 100;
      } else if (cancelChargeconfig.type === 'fixed') {
        cancelCharge = cancelChargeconfig.value;
      }


      const refundAmount =
       amount - gst - processingFee - serviceCharge - cancelCharge;
      logger.info('Calculated Refund Amount:', { refundAmount });


            res.json({
              refundAmount,
              amount,
              gst,
              processingFee,
              serviceCharge,
              cancelCharge,
            });
  } catch (error) {
    error.message = error.message || 'An error occurred while processing the refund amount check.';
      res.status(500).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

