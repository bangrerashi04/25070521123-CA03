const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
      maxlength: [120, 'Title cannot be longer than 120 characters'],
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
      maxlength: [120, 'Artist name cannot be longer than 120 characters'],
    },
    album: {
      type: String,
      trim: true,
      maxlength: [120, 'Album name cannot be longer than 120 characters'],
      default: '',
    },
    genre: {
      type: String,
      trim: true,
      maxlength: 40,
      default: 'Other',
    },
    year: {
      type: Number,
      min: [1900, 'Year must be 1900 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
      default: () => new Date().getFullYear(),
    },
    // Stored in seconds so the client can format it freely.
    duration: {
      type: Number,
      min: [1, 'Duration must be at least 1 second'],
      max: [36000, 'Duration is too large'],
      default: 180,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
      default: 3,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    // Optional attached audio file, served from /uploads/<name>.
    audioUrl: {
      type: String,
      default: '',
    },
    audioName: {
      type: String,
      default: '',
      maxlength: 260,
    },
    audioSize: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

songSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Song', songSchema);
