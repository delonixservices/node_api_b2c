const Coupon = require('../../models/Coupon');
const logger = require('../../config/logger');

/**
 * Add a new coupon
 * Made by: Amber Bisht
 * @param {Object} req - Request object containing coupon details (name, code, value, type, etc.)
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @description Creates a new coupon with validation for duplicate coupon codes
 * @returns {Object} Created coupon data
 */
exports.addCoupon = async (req, res, next) => {

  const name = req.body.name;
  const from = req.body.from;
  const to = req.body.to;
  const code = req.body.code;
  const value = req.body.value;
  const type = req.body.type;
  const product = req.body.product;

  const coupon = await Coupon.findOne({
    "code": code
  });

  if (coupon) {
    return res.status(422).json({
      "message": "coupon code already exists"
    });
  }

  let newCoupon = new Coupon();

  newCoupon.name = name;
  newCoupon.from = from;
  newCoupon.to = to;
  newCoupon.code = code;
  newCoupon.value = value;
  newCoupon.type = type;
  newCoupon.product = product;

  try {
    await newCoupon.save();
  } catch (err) {
    logger.error(`Mongodb error: ${err.message}`);
    return res.status(500).json({
      'message': 'Cannot add coupon'
    });
  }

  res.json({
    "status": 200,
    "data": newCoupon
  });
};

/**
 * Get all coupons
 * Made by: Amber Bisht
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @description Retrieves all coupons sorted by creation date in descending order
 * @returns {Object} List of all coupons
 */
exports.allCoupons = async (req, res, next) => {
  const coupons = await Coupon.find({}).sort("-created_at");
  res.json({
    "status": 200,
    "data": coupons
  });
};

/**
 * Edit existing coupon
 * Updated by: Amber Bisht
 * @param {Object} req - Request object containing coupon details to update
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @description Updates coupon details including validity period, value, and type
 * @returns {Object} Updated coupon data
 */
exports.editCoupon = async (req, res, next) => {
  const id = req.body._id;
  const name = req.body.name;
  const from = req.body.from;
  const to = req.body.to;
  const code = req.body.code;
  const value = req.body.value;
  const type = req.body.type;
  const product = req.body.product;

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return res.status(404).json({
      "message": "coupon code does not exists"
    });
  }

  coupon.name = name;
  coupon.from = from;
  coupon.to = to;
  coupon.code = code;
  coupon.value = value;
  coupon.type = type;
  coupon.product = product;

  try {
    await coupon.save();
  } catch (err) {
    logger.error(`Mongodb error: ${err.message}`);
    return res.status(500).json({
      'message': 'Cannot save coupon'
    });
  }

  res.json({
    "status": 200,
    "data": coupon
  });
};

/**
 * Delete a coupon
 * Made by: Amber Bisht
 * @param {Object} req - Request object containing coupon ID in query
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @description Removes a coupon from the database
 * @returns {Object} Deleted coupon data or error message
 */
exports.deleteCoupon = async (req, res, next) => {
  const id = req.query.id;
  const coupon = await Coupon.findOneAndDelete({
    "_id": id
  });

  if (coupon) {
    res.json({
      "status": 200,
      "data": coupon
    });
  } else {
    res.status(422).json({
      "message": "Unable to delete coupon code"
    });
  }
};