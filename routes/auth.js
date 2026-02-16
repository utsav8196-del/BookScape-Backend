const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Subscribe = require('../models/subscribe');
const Booking = require('../models/booking');
const Contact = require('../models/contact');

// Temporary in-memory storage for subscribers (fallback when MongoDB is not available)
let tempSubscribers = [];

router.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // In a real app, you'd hash and compare passwords
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Subscribe to newsletter
router.post('/api/subscribe', async (req, res) => {
  const { email, name } = req.body;

  try {
    // First try to use MongoDB
    const existing = await Subscribe.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ error: "Email already subscribed" });
      } else {
        // Reactivate subscription
        existing.isActive = true;
        if (name) existing.name = name; // Update name if provided
        await existing.save();
        console.log('Subscription reactivated in MongoDB:', email);
        return res.json({ message: "Subscription reactivated successfully" });
      }
    }

    const subscribe = new Subscribe({ email, name });
    await subscribe.save();
    console.log('New subscriber added to MongoDB:', email, name);
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    console.error('MongoDB subscribe error:', err);
    
    // Check if it's a MongoDB connection error
    if (err.name === 'MongooseServerSelectionError' || 
        err.message.includes('connect') || 
        err.message.includes('timeout') ||
        err.message.includes('ECONNREFUSED')) {
      
      console.log('MongoDB connection failed, using fallback storage');
      
      // Fallback to in-memory storage if MongoDB fails
      try {
        const existingTemp = tempSubscribers.find(sub => sub.email === email);
        if (existingTemp) {
          return res.status(400).json({ error: "Email already subscribed" });
        }

        tempSubscribers.push({
          email: email,
          name: name || '',
          subscribedAt: new Date(),
          isActive: true
        });

        console.log('Subscriber added to temporary storage:', email, name);
        console.log('Total temporary subscribers:', tempSubscribers.length);
        
        res.status(201).json({ 
          message: "Subscribed successfully (temporary storage - MongoDB unavailable)" 
        });
      } catch (fallbackErr) {
        console.error('Fallback storage error:', fallbackErr);
        res.status(500).json({ error: "Server error" });
      }
    } else {
      // Other MongoDB errors
      res.status(500).json({ error: "Database error. Please try again." });
    }
  }
});

// Create booking
router.post('/api/booking', async (req, res) => {
  const {
    name,
    email,
    phone,
    idType,
    idNumber,
    country,
    address,
    checkin,
    checkout,
    guests,
    specialRequest,
    totalAmount
  } = req.body;

  try {
    // Get user ID from request (you might want to add authentication middleware)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const booking = new Booking({
      userId: user._id,
      name,
      email,
      phone,
      idType,
      idNumber,
      country,
      address,
      checkin: new Date(checkin),
      checkout: new Date(checkout),
      guests,
      specialRequest,
      totalAmount,
      paymentStatus: 'paid' // Since payment was successful
    });

    await booking.save();
    res.status(201).json({ 
      message: "Booking created successfully", 
      bookingId: booking._id 
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// contact
router.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    res.status(201).json({ message: 'Message submitted successfully!' });
  } catch (err) {
    console.error('Error saving contact form:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});



module.exports = router;