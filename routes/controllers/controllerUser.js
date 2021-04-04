const express = require('express');
const router = express.Router();
const Joi = require('joi');
const globalFunction = require('../../utils/globalFunction');
const jwt = require('jsonwebtoken');
const serviceUser = require('../services/serviceUser');
const settings = require('../../config/settings');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;
const tokenList = {}


async function register(req, res) {

  const registerParamSchema = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().email().regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).required()
  });
  let isReqParamValid = null;
  try {
    isReqParamValid = await registerParamSchema.validate(req.body, {
      abortEarly: true
    });
  } catch (error) {
    console.log("error  ", error);
    return apiErrorRes(req, res, 'Send valid param!!!');
  }
  let userData = await serviceUser.getUserByEmail(req.body.email);
  if (userData.statusCode === CONSTANTS.SUCCESS && userData.data.isDeleted == true) {

    return apiErrorRes(req, res, 'Your mobile number is deactivated from admin. Please contanct to support.', CONSTANTS.DATA_NULL, CONSTANTS.DEACTIVE_STATUS);

  } else if (userData.statusCode === CONSTANTS.SUCCESS && userData.data.verificationStatus === true) {

    const token = jwt.sign({
      sub: userData.data.id
    }, settings.secret);

    return apiErrorRes(req, res, 'Email alreday  exist and Verified');

  } else if (userData.data == null) {

    let saveUserData = {
      email: req.body.email,
      password: req.body.password
    }
    console.log("saveUserData  ", saveUserData);
    let userdataRes = await serviceUser.saveUser(saveUserData);
    if (userdataRes.statusCode == 11000) {
      return apiErrorRes(req, res, 'mobile already exist!!!');
    } else {
      return apiSuccessRes(req, res, CONSTANTS_MSG.REGISTRATION_SUCCESS_MESSAGE);
    }
  } else {
    return apiErrorRes(req, res, 'email id not exist!!!');
  }
}
async function login(req, res) {
  try {
    const loginParamSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required()
    });
    await loginParamSchema.validate(req.body, {
      abortEarly: true
    });
  } catch (error) {
    return apiErrorRes(req, res, 'Send valid param!!!');
  }

  let findUserData = {
    email: req.body.email,
    password: req.body.password,
  }

  let userData = await serviceUser.verifyEmailPassword(findUserData);
  //console.log("there are the response", userData);

  if (userData.statusCode === CONSTANTS.SUCCESS) {

    const token = jwt.sign({ userId: userData.data.id }, settings.secret, { expiresIn: 900 });

    const refreshToken = jwt.sign({ userId: userData.data.id }, settings.secret, { expiresIn: 86400 })
    let returnData = { email: userData.data.email, token, refreshToken };
    tokenList[refreshToken] = returnData
    console.log(returnData);
    return apiSuccessRes(req, res, CONSTANTS_MSG.LOGIN_SUCCESS, returnData);
  } else if (userData.statusCode === CONSTANTS.NOT_VERIFIED) {
    return apiErrorRes(req, res, 'Mobile is  not Verified', CONSTANTS.DATA_NULL, CONSTANTS.ERROR_CODE_TWO);
  } else if (userData.statusCode === CONSTANTS.ACCESS_DENIED) {
    return apiErrorRes(req, res, 'Enter valid password');
  } else if (userData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, 'Please enter valid email.');
  } else if (userData.statusCode === CONSTANTS.SERVER_ERROR) {
    return apiErrorRes(req, res, CONSTANTS_MSG.LOGIN_FAILURE);

  }

}
async function changepassword(req, res) {
  try {
    const loginParamSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      newPassword: Joi.string().required()
    });
    await loginParamSchema.validate(req.body, {
      abortEarly: true
    });
  } catch (error) {
    return apiErrorRes(req, res, 'Send valid param!!!');
  }

  let findUserData = {
    email: req.body.email,
    password: req.body.password,
    newPassword: req.body.newPassword,
  }

  let userData = await serviceUser.verifyEmailPassword(findUserData);
  if (userData.statusCode === CONSTANTS.SUCCESS) {
    userData.data.password = req.body.newPassword;
    await userData.data.save();
    return apiSuccessRes(req, res, "Password updated successfully");
  } else if (userData.statusCode === CONSTANTS.NOT_VERIFIED) {
    return apiErrorRes(req, res, 'Mobile is  not Verified', CONSTANTS.DATA_NULL, CONSTANTS.ERROR_CODE_TWO);
  } else if (userData.statusCode === CONSTANTS.ACCESS_DENIED) {
    return apiErrorRes(req, res, 'Enter valid password');
  } else if (userData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, 'Please enter valid email.');
  } else if (userData.statusCode === CONSTANTS.SERVER_ERROR) {
    return apiErrorRes(req, res, CONSTANTS_MSG.LOGIN_FAILURE);
  }
}
async function token(req, res) {
  const postData = req.body
    // if refresh token exists
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "email": postData.email,
            "name": postData.name
        }
        const token = jwt.sign(user, settings.secret, { expiresIn: 900})
        const response = {
            "token": token,
        }
        // update the token in the list
        tokenList[postData.refreshToken].token = token
        res.status(200).json(response);        
    } else {
        res.status(404).send('Invalid request')
    }
}

router.post('/token', token);
router.post('/register', register);
router.post('/login', login);
router.post('/changepassword', changepassword);

module.exports = router;