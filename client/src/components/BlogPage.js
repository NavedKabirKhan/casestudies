import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './BlogPage.css';

const BlogPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`https://casestudies.onrender.com/api/posts/${slug}`);
        setPost(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error.message);
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="case_Study_hero_container" 
        style={{ 
          backgroundImage: post.heroImage 
            ? `url(https://casestudies.onrender.com/uploads/heroImages/${post.heroImage})` 
            : 'none'
        }}
      >
        <div className="Case_Stydy_hero_text">
          <h2 className="headTrans">{post.subtitle}</h2>
          <h1 className="headTrans">{post.title}</h1>
        </div>
        <div className="challange_move">
          <img src="/assets/work/landing-circle.svg" alt="" id="circular_text" />
        </div>
      </div>

      {/* Project Overview Section */}
      <div className="Project_Overview_container">
        <div className="Project_Overview_heding">
          <h2 className="selectedTrans">Project <br />Overview</h2>
        </div>
        <div className="Project_Overview_Discovering">
          <h2 className="selectedTrans">{post.overviewTitle}</h2>
          <p className="selectedTrans">{post.overviewContent}</p>
          <div className="Project_Overview_Right_bottom">
            <p className="Project_Overview_Category selectedTrans">Category</p>
            <h2 className="Project_Overview_Tech selectedTrans">{post.category}</h2>
            <br />
            <p className="Project_Overview_Category selectedTrans">Service</p>
            <h2 className="Project_Overview_Tech selectedTrans">{post.type}</h2>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div>
        {post.sections.map((section, index) => (
          <div key={index}>
            {section.type === 'text' && <p>{section.content}</p>}
            {section.type === 'singleImage' && (
              <img
                src={`https://casestudies.onrender.com/uploads/${section.images[0]}`}
                alt="blog"
                className="image-content"
              />
            )}
            {section.type === 'doubleImage' && (
              <div className="image-container-grid">
                {section.images.map((img, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={`https://casestudies.onrender.com/uploads/${img}`}
                    alt="blog"
                    className="image-content"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
