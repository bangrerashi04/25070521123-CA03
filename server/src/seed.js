/**
 * Seed the database with a demo account and a small starter library.
 *
 *   cd server
 *   npm run seed
 *
 * Demo login: demo@melody.app / demo1234
 */
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Song = require('./models/Song');

const DEMO_EMAIL = 'demo@melody.app';
const DEMO_PASSWORD = 'demo1234';

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

    await Song.deleteMany({ user: user._id });
    await Song.insertMany(songs.map((song) => ({ ...song, user: user._id })));

    console.log(`Inserted ${songs.length} demo songs.`);
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

seed();
