const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Blog Post Schema
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  overviewTitle: { type: String },
  overviewContent: { type: String },
  sections: [
    {
      type: { type: String, required: true },
      content: { type: String },
      images: [{ type: String }],
    },
  ],
  slug: { type: String, required: true, unique: true },
  thumbnail: { type: String },
  heroImage: { type: String },
  category: { type: String, required: true },
  type: { type: String, required: true },
  order: { type: Number, default: 0 },  // Add this line
}, { timestamps: true });


const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Upload a thumbnail
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/thumbnails/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const heroImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/heroImages/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const genericStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const uploadThumbnail = multer({ storage: thumbnailStorage });
const uploadHeroImage = multer({ storage: heroImageStorage });
const upload = multer({ storage: genericStorage });

app.get('/api', (req, res) => {
  res.send('API is working!');
});

app.post('/api/upload/thumbnail', authenticateToken, uploadThumbnail.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No thumbnail uploaded' });
  }
  res.json({ filename: req.file.filename });
});

app.post('/api/upload/hero', authenticateToken, uploadHeroImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No hero image uploaded' });
  }
  res.json({ filename: req.file.filename });
});

app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  res.json({ filename: req.file.filename });
});

app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const newPost = new BlogPost(req.body);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error saving blog post:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.get('/api/posts', async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ order: 1 }); // Sorting by the 'order' field
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/posts/reorder', authenticateToken, async (req, res) => {
  const { caseStudies } = req.body;
  try {
    for (let i = 0; i < caseStudies.length; i++) {
      await BlogPost.updateOne({ _id: caseStudies[i]._id }, { $set: { order: i } });
    }
    res.status(200).json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register user (For adding users)
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error: error.message });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    // Create JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
