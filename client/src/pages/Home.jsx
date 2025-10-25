import React, { useEffect, useState } from "react";
import { useBlog } from "../context/BlogContext";
import PostCard from "../components/PostCard";

const Home = () => {
  const { posts, fetchPosts, loading, error } = useBlog();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  if (loading && posts.length === 0) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Latest Blog Posts</h1>
      </div>

      <div className="posts-grid">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="no-posts">
          <p>No posts found. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
};

export default Home;
