import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import User from '../models/User.js';
import { env } from '../lib/env.js'

const resendClient = new Resend(env.RESEND_API_KEY);

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // send welcome email via Resend
    try {
      await resendClient.emails.send({
        from: 'no-reply@maxapp.com',
        to: email,
        subject: 'Welcome to MaxApp!',
        html: `<p>Hi ${name},</p><p>Thanks for registering with MaxApp!</p>`
      });
    } catch (emailErr) {
      console.error('Error sending welcome email', emailErr);
    }

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req, res) => {
  // With JWT, logout is primarily client-side (delete token from storage)
  // This endpoint validates the token is still valid and returns success
  // The client then removes the token from localStorage/sessionStorage
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
