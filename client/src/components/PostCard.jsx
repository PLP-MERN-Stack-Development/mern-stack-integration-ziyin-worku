import React from "react";
import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      {post.featuredImage && (
        <img src={post.featuredImage} alt={post.title} className="post-image" />
      )}
      <div className="post-content">
        <h3 className="post-title">
          <Link to={`/post/${post._id}`}>{post.title}</Link>
        </h3>
        <p className="post-excerpt">{post.excerpt}</p>
        <div className="post-meta">
          <span className="author">By {post.author.username}</span>
          <span className="date">
            {new Date(post.publishedAt).toLocaleDateString()}
          </span>
        </div>
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
      </div>
    </div>
  );
};

export default PostCard;
