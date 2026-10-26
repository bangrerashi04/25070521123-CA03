/**
 * Seed the database with a demo account and a small starter library.
 *
 *   cd server
 *   npm run seed
 *
 * Demo login: demo@melody.app / demo1234
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const connectDB = require('./config/db');
const User = require('./models/User');
const Song = require('./models/Song');
const { UPLOAD_DIR } = require('./middleware/upload');

const DEMO_EMAIL = 'demo@melody.app';
const DEMO_PASSWORD = 'demo1234';

const SAMPLE_AUDIO_NAME = 'melody-sample.wav';
const SAMPLE_AUDIO_PATH = path.join(UPLOAD_DIR, SAMPLE_AUDIO_NAME);
const SAMPLE_SECONDS = 12;

/**
 * Write a small original arpeggio to server/uploads so the demo library has
 * one track that actually plays. 16-bit mono WAV, generated - no copyright.
 */
function createSampleAudio() {
  const rate = 44100;
  const noteLength = 0.4;
  const notes = [261.63, 329.63, 392.0, 523.25]; // C major arpeggio
  const sequence = Array.from({ length: 30 }, (_, index) => notes[index % notes.length]);
  const perNote = Math.floor(rate * noteLength);
  const totalSamples = perNote * sequence.length;

  const buffer = Buffer.alloc(44 + totalSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + totalSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(totalSamples * 2, 40);

  let offset = 44;
  sequence.forEach((frequency) => {
    for (let i = 0; i < perNote; i += 1) {
      const envelope = Math.min(1, i / (rate * 0.02), (perNote - i) / (rate * 0.08));
      const wave =
        Math.sin((2 * Math.PI * frequency * i) / rate) * 0.22 +
        Math.sin((4 * Math.PI * frequency * i) / rate) * 0.05;
      buffer.writeInt16LE(Math.round(wave * 32767 * envelope), offset + i * 2);
    }
    offset += perNote * 2;
  });

  fs.writeFileSync(SAMPLE_AUDIO_PATH, buffer);
  return buffer.length;
}

const songs = [
  { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', genre: 'Electronic', year: 2011, duration: 244, rating: 5, favorite: true },
  { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', genre: 'Pop', year: 2019, duration: 200, rating: 5, favorite: true },
  { title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', genre: 'Rock', year: 1975, duration: 355, rating: 5, favorite: false },
  { title: 'Take Five', artist: 'The Dave Brubeck Quartet', album: 'Time Out', genre: 'Jazz', year: 1959, duration: 324, rating: 4, favorite: false },
  { title: 'Clair de Lune', artist: 'Claude Debussy', album: 'Suite bergamasque', genre: 'Classical', year: 1905, duration: 302, rating: 5, favorite: true },
  { title: 'Redbone', artist: 'Childish Gambino', album: 'Awaken, My Love!', genre: 'R&B', year: 2016, duration: 327, rating: 4, favorite: false },
  { title: 'The Less I Know the Better', artist: 'Tame Impala', album: 'Currents', genre: 'Rock', year: 2015, duration: 216, rating: 4, favorite: true },
  { title: 'Holocene', artist: 'Bon Iver', album: 'Bon Iver', genre: 'Folk', year: 2011, duration: 337, rating: 4, favorite: false },
  { title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile', genre: 'Hip-Hop', year: 2002, duration: 326, rating: 5, favorite: false },
  { title: 'Strobe', artist: 'deadmau5', album: 'For Lack of a Better Name', genre: 'Electronic', year: 2009, duration: 637, rating: 5, favorite: true },
];

async function seed() {
  try {
    await connectDB();

    let user = await User.findOne({ email: DEMO_EMAIL });
    if (!user) {
      user = await User.create({ name: 'Demo Listener', email: DEMO_EMAIL, password: DEMO_PASSWORD });
      console.log('Created demo user.');
    } else {
      console.log('Demo user already exists.');
    }

    const sampleSize = createSampleAudio();
    const demoAudio = {
      title: 'Melody Sample Tone',
      artist: 'Melody',
      album: 'Built-in demo',
      genre: 'Electronic',
      year: new Date().getFullYear(),
      duration: SAMPLE_SECONDS,
      rating: 3,
      favorite: false,
      audioUrl: `/uploads/${SAMPLE_AUDIO_NAME}`,
      audioName: SAMPLE_AUDIO_NAME,
      audioSize: sampleSize,
    };

    await Song.deleteMany({ user: user._id });
    await Song.insertMany([...songs, demoAudio].map((song) => ({ ...song, user: user._id })));

    console.log(`Inserted ${songs.length} demo songs + 1 playable sample.`);
    console.log(`Generated sample audio -> server/uploads/${SAMPLE_AUDIO_NAME} (${SAMPLE_SECONDS}s)`);
    console.log('');
    console.log('  Demo login -> email: demo@melody.app | password: demo1234');
    console.log('');

    await User.db.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = {
  createSampleAudio,
  SAMPLE_AUDIO_NAME,
  SAMPLE_AUDIO_PATH,
  SAMPLE_SECONDS,
};
