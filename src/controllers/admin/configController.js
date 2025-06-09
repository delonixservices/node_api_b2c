const Config = require('../../models/Config');
// const Api = require('../../services/apiService');
// const User = require('../../models/User');

/**
 * Get system configuration
 * Made by: Amber Bisht
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @description Retrieves the current system configuration including markup, service charges, and fees
 * @returns {Object} Current configuration data
 */
exports.getConfig = async (req, res, next) => {
  const config = await Config.findOne({});

  if (!config) {
    return res.status(404).json({
      "message": "config not found"
    });
  }

  res.json({
    "status": 200,
    "data": config
  });
}

/**
 * Update system configuration
 * Updated by: Amber Bisht
 * @param {Object} req - Request object containing configuration updates
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @description Updates system configuration including markup, service charges, processing fees, and cancellation charges
 * @returns {Object} Updated configuration data
 * @throws {Error} Validation errors for negative values or missing required fields
 */
exports.editConfig = async (req, res, next) => {
  const markup = req.body.markup;
  const serviceCharge = req.body.serviceCharge;
  const processingFee = req.body.processingFee;
  const cancellationCharge = req.body.cancellationCharge;

  // "if(markup.value)" will be true for all Number types except 0
  // so we have to check for value == "0"  if we want markup.value = 0 too

  if (!markup || !markup.type || !(markup.value || markup.value == "0") || !serviceCharge || !serviceCharge.type || !(serviceCharge.value || serviceCharge.value == "0") || !(processingFee || processingFee == "0") || !cancellationCharge || !cancellationCharge.type || !(cancellationCharge.value || cancellationCharge.value == "0")) {
    return res.status(400).json({
      "message": "validation failed",
      "data": req.body
    });
  }

  if (markup.value < 0) {
    return res.status(422).json({
      "message": "markup.value should be greater than or equals to zero."
    });
  }
  if (serviceCharge.value < 0) {
    return res.status(422).json({
      "message": "serviceCharge.value should be greater than or equals to zero."
    });
  }

  if (processingFee < 0) {
    return res.status(422).json({
      "message": "ProcessingFee should be greater than or equals to zero."
    });
  }
  if (cancellationCharge.value < 0) {
    return res.status(422).json({
      "message": "cancellationCharge.value should be greater than or equals to zero."
    });
  }

  // update or create new Config collection if it is not there
  const config = await Config.findOneAndUpdate({}, {
    "markup": markup,
    "service_charge": serviceCharge,
    "processing_fee": processingFee,
    'cancellation_charge': cancellationCharge
  }, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  // console.log(config);
  if (!config) {
    return res.status(404).json({
      "message": "config not found"
    });
  }

  res.json({
    "status": 200,
    "data": config
  });
}