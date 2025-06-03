const {
  validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  jwtSecret
} = require('../config/index');
const randtoken = require('rand-token');
const User = require('../models/User');
const Token = require('../models/Token');
const Sms = require('../services/smsService');
const { OAuth2Client } = require('google-auth-library');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation Failed!');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { name, last_name, mobile, email, password } = req.body;

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const hashedPwd = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      last_name,
      mobile,
      email,
      password: hashedPwd,
      verified: false,
      isGoogleUser: false
    });

    const otp = Sms.generateOtp();

    Sms.sendOtp("91" + user.mobile, "Thank you for registering with TripBazaar. Your OTP is " + otp, otp, (data) => {
      if (data.type != "success") {
        throw new Error('Cannot send otp for successful registration');
      }
    });
    
    user.otp = otp;
    await user.save();

    res.json({
      'message': 'User created successfully.',
      'userId': user._id
    });
  } catch (error) {
    return next(error);
  }
}

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation Failed!');
      error.statusCode = 422;
      error.data = errors.array();
      return next(error);
    }

    const { email, password } = req.body;

    // Find user by email instead of mobile
    let user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Email or Password incorrect');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is a Google user
    if (user.isGoogleUser) {
      const error = new Error('Please login with Google');
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Email or Password incorrect');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret
    );
    const refreshToken = randtoken.uid(256);

    await new Token({
      refresh_token: refreshToken,
      userId: user._id
    }).save();

    user = user.toObject();
    delete user.otp;
    delete user.password;
    delete user.password_reset_expiry;
    delete user.password_reset_token;

    res.json({
      token,
      refreshToken,
      user
    });
  } catch (err) {
    next(err);
  }
}

exports.googleLogin = async (req, res, next) => {
  try {
    console.log('🔹 [BACKEND] /auth/google-login called');
    console.log('🔹 [BACKEND] Full request body:', JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('🔹 [BACKEND] Validation errors:', errors.array());
      const error = new Error('Validation Failed!');
      error.statusCode = 422;
      error.data = errors.array();
      return next(error);
    }

    const { credential } = req.body;
    console.log('🔹 [BACKEND] Credential received:', credential ? 'Yes' : 'No');
    console.log('🔹 [BACKEND] Credential length:', credential ? credential.length : 0);

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.log('🔹 [BACKEND] Error: GOOGLE_CLIENT_ID not set');
      const error = new Error('Google Client ID is not set in environment variables');
      error.statusCode = 500;
      return next(error);
    }
    console.log('🔹 [BACKEND] GOOGLE_CLIENT_ID is set');

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    if (!credential) {
      console.log('🔹 [BACKEND] Error: No credential provided');
      const error = new Error('Google credential is required');
      error.statusCode = 400;
      return next(error);
    }

    let payload;
    try {
      console.log('🔹 [BACKEND] Attempting to verify Google token...');
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
      console.log('🔹 [BACKEND] Google Payload received:', {
        email: payload.email,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        sub: payload.sub
      });
      console.log(payload.email)

      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        console.log('🔹 [BACKEND] Error: Token expired');
        throw new Error('Google token has expired');
      }
    } catch (error) {
      console.error('🔹 [BACKEND] Google token verification failed:', error.message);
      return next(new Error('Invalid Google token: ' + error.message));
    }

    // First check if user exists with this email
    console.log('🔹 [BACKEND] Searching for user with email:', payload.email);
    let user = await User.findOne({ email: payload.email });
    console.log('🔹 [BACKEND] User found:', user ? 'Yes' : 'No');
    let isNewUser = false;

    if (user) {
      console.log('🔹 [BACKEND] Existing user found:', {
        id: user._id,
        email: user.email,
        isGoogleUser: user.isGoogleUser
      });
      
      // User exists, update their Google info if needed
      if (!user.isGoogleUser) {
        console.log('🔹 [BACKEND] Converting regular user to Google user');
        // Convert existing user to Google user
        user.isGoogleUser = true;
        user.googleId = payload.sub;
        user.verified = true;
        // Update name if it's different
        if (payload.given_name && user.name !== payload.given_name) {
          user.name = payload.given_name;
        }
        if (payload.family_name && user.last_name !== payload.family_name) {
          user.last_name = payload.family_name;
        }
        await user.save();
        console.log('🔹 [BACKEND] User converted to Google user successfully');
      } else {
        console.log('🔹 [BACKEND] Updating existing Google user info');
        // Update Google user info if needed
        if (payload.given_name && user.name !== payload.given_name) {
          user.name = payload.given_name;
        }
        if (payload.family_name && user.last_name !== payload.family_name) {
          user.last_name = payload.family_name;
        }
        if (user.googleId !== payload.sub) {
          user.googleId = payload.sub;
        }
        await user.save();
        console.log('🔹 [BACKEND] Google user info updated successfully');
      }
    } else {
      console.log('🔹 [BACKEND] Creating new Google user');
      // Create new user
      user = new User({
        name: payload.given_name || payload.name,
        last_name: payload.family_name || '',
        email: payload.email,
        isGoogleUser: true,
        googleId: payload.sub,
        verified: true
      });
      await user.save();
      console.log('🔹 [BACKEND] New Google user created successfully');
      isNewUser = true;
    }

    // Generate tokens
    console.log('🔹 [BACKEND] Generating tokens');
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret
    );
    const refreshToken = randtoken.uid(256);

    // Save refresh token
    await new Token({
      refresh_token: refreshToken,
      userId: user._id
    }).save();
    console.log('🔹 [BACKEND] Refresh token saved');

    // Clean user object
    user = user.toObject();
    delete user.password;
    delete user.otp;
    delete user.password_reset_expiry;
    delete user.password_reset_token;

    console.log('🔹 [BACKEND] Login successful, sending response');
    res.json({
      token,
      refreshToken,
      user,
      isNewUser,
      message: isNewUser ? 'New user created and logged in' : 'Existing user logged in'
    });
  } catch (error) {
    console.error('🔹 [BACKEND] Google login error:', error);
    console.error('🔹 [BACKEND] Error stack:', error.stack);
    next(error);
  }
}

exports.logout = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    const error = new Error('Please provide refresh token');
    error.statusCode = 404;
    return next(error);
  }
  let token;
  try {
    token = await Token.findOneAndDelete({
      'refresh_token': refreshToken,
      'userId': req.user._id
    });
  } catch (err) {
    console.log('Cannot delete refresh token');
    return next(err);
  }

  console.log(token);
  if (!token) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 404;
    return next(error);
  }

  return res.status(200).send({
    "message": 'success'
  })
}

exports.refreshToken = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const refreshToken = req.body.refreshToken;
  const userId = req.body.userId;

  try {
    const token = await Token.findOne({
      'refresh_token': refreshToken
    });
    if (!token) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 404;
      throw error;
    }

    if (token.userId.toString() !== userId) {
      const error = new Error('Not Authorized!');
      error.statusCode = 403;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Not Authorized');
      error.statusCode = 403;
      throw error;
    }

    const accessToken = jwt.sign({
      'userId': user._id,
      'mobile': user.mobile
    }, jwtSecret);

    res.status(200).json({
      'token': accessToken,
      'refreshToken': refreshToken
    });
  } catch (err) {
    next(err);
  }
}

exports.authUser = async (req, res, next) => {
  let user = await User.findById(req.user._id);

  if (!user) {
    const error = new Error('Not Authorized');
    error.statusCode = 403;
    return next(error);
  }
  user = user.toObject();
  delete user.password;
  delete user.otp;
  delete user.password_reset_expiry;
  delete user.password_reset_token;
  res.json(user);
}

// verify otp
exports.verifyOtp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const otp = req.body.otp;
  const userId = req.body.userId;

  let user = await User.findOne({
    "_id": userId
  })

  if (!otp || !user) {
    const error = new Error('Invalid req params');
    error.statusCode = 400;
    return next(error);
  }

  if (user.otp == otp) {
    user.verified = true;
    await user.save();
  } else {
    const error = new Error('Invalid otp.');
    error.statusCode = 400;
    return next(error);
  }
  user = user.toObject();
  delete user.password;
  delete user.otp;
  delete user.password_reset_expiry;

  return res.json({
    status: 200,
    data: user
  })
};

// forgot password
exports.forgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const mobile = req.body.mobile;

  let user = await User.findOne({
    'mobile': mobile
  });

  if (!user || !user.verified) {
    const error = new Error('Can not find user with mobile no.');
    error.statusCode = 404;
    return next(error);
  }

  const otp = await Sms.generateOtp();
  user.otp = otp;

  Sms.sendOtp("91" + mobile, "Your OTP is " + otp, otp, (data) => {
    if (data.type != "success") {
      const error = new Error(`Failed to send otp to ${mobile}.`);
      error.statusCode = 500;
      return next(error);
    }
  });

  const password_reset_token = randtoken.uid(25);
  // password_reset will be valid for 15 minutes, i.e 900000 ms
  const password_reset_expiry = Date.now() + 900000;

  user.password_reset_token = password_reset_token;
  user.password_reset_expiry = password_reset_expiry;
  await user.save();
  user = user.toObject();
  delete user.password;
  delete user.otp;
  delete user.password_reset_expiry;
  delete user.password_reset_token;
  // console.log(user);
  res.json({
    "status": 200,
    "data": user
  });
};

// verifyuser
exports.verifyUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    // return next(error);
    return next(error);
  }
  const otp = req.body.otp;
  const userId = req.body.userId;

  try {
    let user = await User.findOne({
      "_id": userId
    });

    if (!user) {
      const error = new Error('Cannot find user.');
      error.statusCode = 404;
      throw error;
    }

    if (user._id != req.user._id) {
      const error = new Error('Not Authorized');
      error.statusCode = 403;
      throw error;
    }

    // console.log(user);
    // console.log(otp, user.otp);

    if (user.otp == otp) {
      user.verified = true;
      await user.save();
      user = user.toObject();
      delete user.password;
      delete user.otp;
      delete user.password_reset_expiry;
      delete user.password_reset_token;
      return res.status(200).json({
        message: "Account verified successfuly"
      })
    } else {
      const error = new Error('Invalid otp.');
      error.statusCode = 400;
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

// reset password
exports.resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const userId = req.body.userId;
  const password = req.body.password;
  const password_reset_token = req.body.password_reset_token;

  let user = await User.findOne({
    "_id": userId
  });

  if (!user) {
    const error = new Error('Invalid user');
    error.statusCode = 404;
    return next(error);
  }

  if (user.password_reset_token === password_reset_token && Date.now() < user.password_reset_expiry) {
    const hashedPwd = await bcrypt.hash(password, 12);
    user.password = hashedPwd;
    await user.save();
  } else {
    const error = new Error('Not Authorized, Invalid password reset token');
    error.statusCode = 403;
    return next(error);
  }

  user = user.toObject();
  delete user.password;
  delete user.otp;

  return res.status(200).json({
    "status": 200,
    "message": "Password changed successfully"
  });
};

exports.updateUserProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const userId = req.body.userId;
  const name = req.body.name;
  const lastName = req.body.last_name;
  const email = req.body.email;

  let user = await User.findOne({
    "_id": userId
  });

  if (!user) {
    const error = new Error('Can not find user with mobile no.');
    error.statusCode = 404;
    return next(error);
  }

  if (user._id != req.user._id) {
    const error = new Error('Not Authorized');
    error.statusCode = 403;
    return next(error);
  }

  user.name = name;
  user.last_name = lastName;
  user.email = email;

  await user.save();
  user = user.toObject();
  delete user.password;
  delete user.otp;
  delete user.password_reset_expiry;
  delete user.password_reset_token;

  return res.status(200).json({
    'user': user
  })
};

// password change
exports.updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const userId = req.body.userId;
  const password = req.body.password;
  const newPassword = req.body.newPassword;

  let user = await User.findById({
    "_id": userId
  });

  if (user._id != req.user._id) {
    const error = new Error('Not Authorized');
    error.statusCode = 403;
    return next(error);
  }

  const isEqual = bcrypt.compare(password, user.password)

  if (!isEqual) {
    const error = new Error('Invalid password');
    error.statusCode = 401;
    return next(error);
  }

  const hashedPwd = await bcrypt.hash(newPassword, 12);
  user.password = hashedPwd;
  await user.save();
  user = user.toObject();
  delete user.password;
  delete user.otp;
  delete user.password_reset_expiry;
  delete user.password_reset_token;

  return res.status(200).json({
    message: "Password updated successfuly",
    user: user
  })
};

// Not completed
// @TODO Verify otp than update mobile
// @TODO Verify Password than update mobile
exports.updateMobile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const userId = req.body.id;
  const mobile = req.body.mobile;

  let user = await User.findOne({
    "_id": userId
  });

  if (!user) {
    const error = new Error('Invalid user.');
    error.statusCode = 403;
    return next(error);
  }

  if (user._id !== req.user._id) {
    const error = new Error('Not Authorized');
    error.statusCode = 403;
    return next(error);
  }

  const otp = await Sms.generateOtp();
  user.otp = otp;

  Sms.sendOtp("91" + mobile, "Your OTP is " + otp, otp, (data) => {
    if (data.type != "success") {
      const error = new Error('Failed to send otp.');
      error.statusCode = 500;
      return next(error);
    }
  });

  // user.mobile = mobile;
  await user.save();
  user = user.toObject();
  delete user.password;
  delete user.otp;
  delete user.password_reset_expiry;
  delete user.password_reset_token;

  return res.status(200).json({
    message: "Mobile no updated successfuly",
    user: user
  })
};