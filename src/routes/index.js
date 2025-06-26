const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const HotelOffer = require('../models/HotelOffer');
const FlightOffer = require('../models/FlightOffer');
const HolidayOffer = require('../models/HolidayOffer');
const SpecialOffer = require('../models/SpecialOffer');
const GstDetail = require('../models/GstDetail');

const {
  dateCompare
} = require('../utils/common');

router.post('/couponCheck', async (req, res, next) => {

  let term = req.body;

  try {
    if (term.code == undefined) {
      throw new Error('Coupon code is required');
    }

    let dataObj = await Coupon.findOne({
      'code': term.code
    });
    if (dataObj == null) {
      throw new Error('Sorry invalid Coupon Code');
    }

    let couponCode = dataObj.toJSON();
    let currentDate = new Date();
    if (dateCompare(currentDate, new Date(couponCode.from), new Date(couponCode.to)) == true) {
      res.json({
        "success": 1,
        "code": couponCode
      })
    } else {
      throw new Error('Sorry is expired on invalid!!!');
    }
  } catch (err) {
    return next(err);
  }

});

router.get('/coupons/global', async (req, res, next) => {
  try {
    // Find only coupons that are explicitly marked as global
    let globalCoupons = await Coupon.find({ isGlobal: true });

    // discard expired offers
    globalCoupons = globalCoupons.filter((coupon) => {
      const expireTime = new Date(coupon.to).getTime();
      const isExpired = Date.now() > expireTime;
      if (!isExpired) {
        return true;
      }
    });

    res.json({
      "status": 200,
      "data": globalCoupons
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/site/allbanner', async (req, res) => {
  let banners = await Banner.find({});

  // discard expired offers
  banners = banners.filter((banner) => {
    const expireTime = new Date(banner.to).getTime();
    const isExpired = Date.now() > expireTime;
    if (!isExpired) {
      return true;
    }
  });

  res.json({
    "status": 200,
    "data": banners
  });
});


router.get('/site/holidaypackage', async (req, res) => {
  let holidayOffers = await HolidayOffer.find({});

  // discard expired offers
  holidayOffers = holidayOffers.filter((holidayOffer) => {
    const expireTime = new Date(holidayOffer.to).getTime();
    const isExpired = Date.now() > expireTime;
    if (!isExpired) {
      return true;
    }
  });

  res.json({
    "status": 200,
    "data": holidayOffers
  });
});


router.get('/site/popularhotel', async (req, res) => {
  let hotelOffers = await HotelOffer.find({});

  // discard expired offers
  hotelOffers = hotelOffers.filter((hotelOffer) => {
    const expireTime = new Date(hotelOffer.to).getTime();
    const isExpired = Date.now() > expireTime;
    if (!isExpired) {
      return true;
    }
  });

  res.json({
    "status": 200,
    "data": hotelOffers
  });
});

router.get('/site/allspacialoffer', async (req, res) => {
  let specialOffers = await SpecialOffer.find({});

  // discard expired offers
  specialOffers = specialOffers.filter((specialOffer) => {
    const expireTime = new Date(specialOffer.to).getTime();
    const isExpired = Date.now() > expireTime;
    if (!isExpired) {
      return true;
    }
  });

  res.json({
    "status": 200,
    "data": specialOffers
  });
});


// ====================================
// ========== updated routes ==========
// ====================================

router.get('/banners', async (req, res) => {
  let banners = await Banner.find({});

  // discard expired offers
  banners = banners.filter((banner) => {
    const expireTime = new Date(banner.to).getTime();
    const isExpired = Date.now() > expireTime;
    if (!isExpired) {
      return true;
    }
  });

  res.json({
    "status": 200,
    "data": banners
  });
});


router.get('/packages-holiday', async (req, res) => {
  let holidayOffers = await HolidayOffer.find({});

  // discard expired offers
  holidayOffers = holidayOffers.filter((holidayOffer) => {
    const expireTime = new Date(holidayOffer.to).getTime();
    const isExpired = Date.now() > expireTime;
    if (!isExpired) {
      return true;
    }
  });

  res.json({
    "status": 200,
    "data": holidayOffers
  });
});

router.get('/offers-flight', async (req, res) => {
  let flightOffer = await FlightOffer.find({});

  // discard expired offers
  flightOffer = flightOffer.filter((flightOffer) => {
    const expireTime = new Date(flightOffer.to).getTime();
    const isExpired = Date.now() > expireTime;
    if (!isExpired) {
      return true;
    }
  });

  res.json({
    "status": 200,
    "data": flightOffer
  });
});

router.get('/offers-hotel', async (req, res) => {
  let hotelOffers = await HotelOffer.find({});

  // discard expired offers
  hotelOffers = hotelOffers.filter((hotelOffer) => {
    const expireTime = new Date(hotelOffer.to).getTime();
    const isExpired = Date.now() > expireTime;
    if (!isExpired) {
      return true;
    }
  });

  res.json({
    "status": 200,
    "data": hotelOffers
  });
});

router.get('/offers-special', async (req, res) => {
  let specialOffers = await SpecialOffer.find({});

  // discard expired offers
  specialOffers = specialOffers.filter((specialOffer) => {
    const expireTime = new Date(specialOffer.to).getTime();
    const isExpired = Date.now() > expireTime;
    if (!isExpired) {
      return true;
    }
  });

  res.json({
    "status": 200,
    "data": specialOffers
  });
});

// offers-all api for IOS app's home page
router.get('/offers-all', async (req, res) => {
  let specialOffers;
  try {
    specialOffers = await SpecialOffer.find({});

    // discard expired offers
    specialOffers = specialOffers.filter((specialOffer) => {
      const expireTime = new Date(specialOffer.to).getTime();
      const isExpired = Date.now() > expireTime;
      if (!isExpired) {
        return true;
      }
    });

  } catch (err) {
    specialOffers = [];
    console.log(err);
  }

  let flightOffers;
  try {

    flightOffers = await FlightOffer.find({});

    // discard expired offers
    flightOffers = flightOffers.filter((flightOffer) => {
      const expireTime = new Date(flightOffer.to).getTime();
      const isExpired = Date.now() > expireTime;
      if (!isExpired) {
        return true;
      }
    });
  } catch (err) {
    flightOffers = [];
    console.log(err);
  }

  let hotelOffers;
  try {

    hotelOffers = await HotelOffer.find({});

    // discard expired offers
    hotelOffers = hotelOffers.filter((hotelOffer) => {
      const expireTime = new Date(hotelOffer.to).getTime();
      const isExpired = Date.now() > expireTime;
      if (!isExpired) {
        return true;
      }
    });
  } catch (err) {
    hotelOffers = [];
    console.log(err);
  }

  let holidayOffers;
  try {

    holidayOffers = await HolidayOffer.find({});

    // discard expired offers
    holidayOffers = holidayOffers.filter((holidayOffer) => {
      const expireTime = new Date(holidayOffer.to).getTime();
      const isExpired = Date.now() > expireTime;
      if (!isExpired) {
        return true;
      }
    });
  } catch (err) {
    holidayOffers = [];
    console.log(err);
  }

  let banners;
  try {

    banners = await Banner.find({});

    // discard expired offers
    banners = banners.filter((banner) => {
      const expireTime = new Date(banner.to).getTime();
      const isExpired = Date.now() > expireTime;
      if (!isExpired) {
        return true;
      }
    });
  } catch (err) {
    banners = [];
    console.log(err);
  }

  const allOffers = {
    'specialOffers': specialOffers,
    'flightOffers': flightOffers,
    'hotelOffers': hotelOffers,
    'holidayOffers': holidayOffers,
    'banners': banners
  }

  return res.json({
    "status": 200,
    "data": allOffers
  });
});

router.post('/gst-details', async (req, res, next) => {
  let gstData = req.body;

  try {
    // Validate required fields
    const requiredFields = ['gstnumber', 'name', 'email', 'address', 'city', 'pincode', 'state', 'mobile'];
    for (let field of requiredFields) {
      if (!gstData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate GST number format (2 digits + 10 digits + 1 digit + 1 digit)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstData.gstnumber)) {
      throw new Error('Invalid GST number format. Please enter a valid 15-character GST number');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gstData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate mobile number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(gstData.mobile)) {
      throw new Error('Invalid mobile number. Please enter a 10-digit mobile number');
    }

    // Validate pincode (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(gstData.pincode)) {
      throw new Error('Invalid pincode. Please enter a 6-digit pincode');
    }

    // Check if GST number already exists
    const existingGst = await GstDetail.findOne({ gstnumber: gstData.gstnumber });
    if (existingGst) {
      throw new Error('GST number already exists');
    }

    // Create new GST detail
    const newGstDetail = new GstDetail(gstData);
    const savedGstDetail = await newGstDetail.save();

    res.json({
      "success": 1,
      "message": "GST details saved successfully",
      "data": savedGstDetail
    });

  } catch (err) {
    return next(err);
  }
});

router.get('/gst-details/:gstnumber', async (req, res, next) => {
  try {
    const { gstnumber } = req.params;

    if (!gstnumber) {
      throw new Error('GST number is required');
    }

    const gstDetail = await GstDetail.findOne({ gstnumber: gstnumber });

    if (!gstDetail) {
      return res.status(404).json({
        "success": 0,
        "message": "GST details not found"
      });
    }

    res.json({
      "success": 1,
      "data": gstDetail
    });

  } catch (err) {
    return next(err);
  }
});

router.put('/gst-details/:gstnumber', async (req, res, next) => {
  try {
    const { gstnumber } = req.params;
    const updateData = req.body;

    if (!gstnumber) {
      throw new Error('GST number is required');
    }

    // Validate required fields if updating
    const requiredFields = ['name', 'email', 'address', 'city', 'pincode', 'state', 'mobile'];
    for (let field of requiredFields) {
      if (updateData[field] !== undefined && !updateData[field]) {
        throw new Error(`${field} cannot be empty`);
      }
    }

    const updatedGstDetail = await GstDetail.findOneAndUpdate(
      { gstnumber: gstnumber },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedGstDetail) {
      return res.status(404).json({
        "success": 0,
        "message": "GST details not found"
      });
    }

    res.json({
      "success": 1,
      "message": "GST details updated successfully",
      "data": updatedGstDetail
    });

  } catch (err) {
    return next(err);
  }
});

module.exports = router;