import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { postService } from "../services/postService";
import { useApi } from "../hooks/useApi";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const { callApi, loading, error } = useApi();

  useEffect(() => {
    const fetchPost = async () => {
      const response = await callApi(postService.getPost, id);
      setPost(response.data);
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!post) {
    return <div className="not-found">Post not found</div>;
  }

  return (
    <div className="post-page">
      <Link to="/" className="back-link">
        ← Back to Posts
      </Link>

      <article className="post-detail">
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="post-featured-image"
          />
        )}

        <h1 className="post-title">{post.title}</h1>

        <div className="post-meta">
          <span className="author">By {post.author.username}</span>
          <span className="date">
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
          </span>
          <span className="views">{post.viewCount} views</span>
        </div>

        <div className="post-content">{post.content}</div>

        <div className="post-categories">
          {post.categories.map((category) => (
            <span
              key={category._id}
              className="category-tag"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
};

export default Post;
