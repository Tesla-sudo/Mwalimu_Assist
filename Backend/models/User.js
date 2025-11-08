const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'admin'], default: 'teacher'},
  classes: [{ type: Number, min: 1, max: 9}],
  subjects: [String]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);