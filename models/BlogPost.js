const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'text', 'singleImage', 'doubleImage'
  content: { type: String }, // For text sections
  images: [{ type: String }], // For image sections
});

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    sections: [
      {
        type: { type: String, required: true },
        content: { type: String },
        images: [{ type: String }],
      },
    ],
    slug: { type: String, required: true, unique: true },
  }, { timestamps: true });  // Ensure timestamps are enabled
  
  

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
