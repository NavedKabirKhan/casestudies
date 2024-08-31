import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css'; // Import the CSS module
import workStyles from '../css/Work.module.css';
import '../css/global.min.css';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('https://casestudies.onrender.com/api/posts');
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error.message);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (posts.length === 0) return <div>No posts available</div>;

  const renderPost = (post, isWide) => (
    <div data-links={post.slug} className={workStyles.thumbnailLinks}>
      <Link to={`/posts/${post.slug}`}>
        <div className={`${workStyles.imageContainerSingle} textAnim`}>
          <img
            src={`https://casestudies.onrender.com/uploads/thumbnails/${post.thumbnail}`}
            alt={post.title}
            className={`${workStyles.thumbnailImage} animTxt ${isWide ? workStyles.landscapesRatio : 'squareRatio'}`}
          />
          <div className={workStyles.detailsContainer}>
            <h3 className={workStyles.workHeadingClient}>{post.title}</h3>
            <p className={workStyles.vertical}>
              {post.category} <span>| {post.type}</span>
            </p>
          </div>
        </div>
      </Link>
    </div>
  );

  const renderPosts = () => {
    const postElements = [];

    // Handle the first post as a wide post at the top
    if (posts.length > 0) {
      const wideTopPost = (
        <div key={`wide-post-top`} className={workStyles.singleImageDetailHolder}>
          {renderPost(posts[0], true)}
        </div>
      );
      postElements.push(wideTopPost);
    }

    // Start the loop from the second post
    for (let i = 1; i < posts.length; i += 5) {
      // Handle 2 posts in a row
      const firstRow = (
        <div key={`first-row-${i}`} className={workStyles.doubleImageDetailHolder}>
          {posts[i] && renderPost(posts[i], false)}
          {posts[i + 1] && renderPost(posts[i + 1], false)}
        </div>
      );

      // Handle the next 2 posts in a row
      const secondRow = (
        <div key={`second-row-${i}`} className={workStyles.doubleImageDetailHolder}>
          {posts[i + 2] && renderPost(posts[i + 2], false)}
          {posts[i + 3] && renderPost(posts[i + 3], false)}
        </div>
      );

      // Handle the wide post
      const widePost = (
        <div key={`wide-post-${i}`} className={workStyles.singleImageDetailHolder}>
          {posts[i + 4] && renderPost(posts[i + 4], true)}
        </div>
      );

      postElements.push(firstRow, secondRow, widePost);
    }

    return postElements;
  };

  return (
    <section className={`${workStyles.workPageGridSection} f-upper-section`}>
      <h2 className={`${workStyles.caseStudyHeading} headTrans`}>Case Studies ({posts.length})</h2>
      {renderPosts()}
    </section>
  );
};

export default HomePage;
