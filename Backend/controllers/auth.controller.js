const User = require('../models/User');
const UserRole = require('../models/UserRole');
const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmailVerification } = require('../services/email.service');

const EMAIL_CODE_TTL_MS = 15 * 60 * 1000;
const PHONE_CODE_TTL_MS = 10 * 60 * 1000;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const normalizePhone = (phone) => (phone || '').replace(/[^\d+]/g, '');
const isValidPhone = (phone) => /^\+?\d{10,15}$/.test(phone);
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.signup = async (req, res) => {
  const { email, password, name, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const normalizedPhone = phone ? normalizePhone(phone) : undefined;
  if (normalizedPhone && !isValidPhone(normalizedPhone)) {
    return res.status(400).json({ message: 'Please provide a valid phone number.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const emailCode = generateCode();
  const emailCodeHash = await bcrypt.hash(emailCode, 10);
  const emailCodeExpires = new Date(Date.now() + EMAIL_CODE_TTL_MS);

  const user = await User.create({
    email: email.toLowerCase(),
    password: hashed,
    email_verified: false,
    email_verification_hash: emailCodeHash,
    email_verification_expires: emailCodeExpires
  });
  await UserRole.create({ user_id: user._id, role: 'user' });
  await Profile.create({
    user_id: user._id,
    name,
    phone: normalizedPhone,
    phone_verified: false
  });

  await sendEmailVerification({ to: user.email, name, code: emailCode });

  res.json({
    message: 'Signup successful. Please verify your email to continue.',
    emailVerificationRequired: true,
    devEmailCode: process.env.EMAIL_DEV_MODE === 'true' ? emailCode : undefined
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(400).json({ message: "Invalid creds" });

  if (!user.email_verified) {
    return res.status(403).json({ message: 'Email not verified. Please verify your email first.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid creds" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ token });
};

exports.requestEmailVerification = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (user.email_verified) {
    return res.json({ message: 'Email already verified.' });
  }

  const emailCode = generateCode();
  user.email_verification_hash = await bcrypt.hash(emailCode, 10);
  user.email_verification_expires = new Date(Date.now() + EMAIL_CODE_TTL_MS);
  await user.save();

  await sendEmailVerification({ to: user.email, code: emailCode });

  res.json({
    message: 'Verification email sent.',
    devEmailCode: process.env.EMAIL_DEV_MODE === 'true' ? emailCode : undefined
  });
};

exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (user.email_verified) {
    return res.json({ message: 'Email already verified.' });
  }

  if (!user.email_verification_hash || !user.email_verification_expires) {
    return res.status(400).json({ message: 'No verification code found. Request a new one.' });
  }

  if (user.email_verification_expires < new Date()) {
    return res.status(400).json({ message: 'Verification code expired. Request a new one.' });
  }

  const isValid = await bcrypt.compare(code.toString(), user.email_verification_hash);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid verification code.' });
  }

  user.email_verified = true;
  user.email_verification_hash = undefined;
  user.email_verification_expires = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully.' });
};

exports.requestPhoneOtp = async (req, res) => {
  const { phone } = req.body;
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
    return res.status(400).json({ message: 'Please provide a valid phone number.' });
  }

  const profile = await Profile.findOne({ phone: normalizedPhone });
  if (!profile) {
    return res.status(404).json({ message: 'Phone number not found.' });
  }

  const otp = generateCode();
  profile.phone_otp_hash = await bcrypt.hash(otp, 10);
  profile.phone_otp_expires = new Date(Date.now() + PHONE_CODE_TTL_MS);
  await profile.save();

  if (process.env.SMS_DEV_MODE === 'true') {
    console.warn(`SMS_DEV_MODE enabled. OTP for ${normalizedPhone}: ${otp}`);
  }

  res.json({
    message: 'OTP sent to phone number.',
    devPhoneCode: process.env.SMS_DEV_MODE === 'true' ? otp : undefined
  });
};

exports.verifyPhoneOtp = async (req, res) => {
  const { phone, code } = req.body;
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone || !code) {
    return res.status(400).json({ message: 'Phone and OTP code are required.' });
  }

  const profile = await Profile.findOne({ phone: normalizedPhone });
  if (!profile) {
    return res.status(404).json({ message: 'Phone number not found.' });
  }

  if (!profile.phone_otp_hash || !profile.phone_otp_expires) {
    return res.status(400).json({ message: 'No OTP found. Request a new one.' });
  }

  if (profile.phone_otp_expires < new Date()) {
    return res.status(400).json({ message: 'OTP expired. Request a new one.' });
  }

  const isValid = await bcrypt.compare(code.toString(), profile.phone_otp_hash);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid OTP code.' });
  }

  profile.phone_verified = true;
  profile.phone_otp_hash = undefined;
  profile.phone_otp_expires = undefined;
  await profile.save();

  res.json({ message: 'Phone verified successfully.' });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user profile
    const profile = await Profile.findOne({ user_id: user._id });
    
    // Get user role
    const userRole = await UserRole.findOne({ user_id: user._id });

    // Return user with profile and role info
    res.json({
      _id: user._id,
      email: user.email,
      name: profile?.name || user.email.split('@')[0],
      phone: profile?.phone,
      email_verified: user.email_verified,
      phone_verified: profile?.phone_verified || false,
      role: userRole?.role || 'user',
    });
  } catch (error) {
    console.error('Error in me endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
