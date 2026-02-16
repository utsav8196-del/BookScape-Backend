const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    require:true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Invalid email address']
  },
  message: {
    type:String,
    require:true
  }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);