import React, { createContext, useContext, useReducer } from "react";
import { postService } from "../services/postService";
import { useApi } from "../hooks/useApi";

const BlogContext = createContext();

const blogReducer = (state, action) => {
  switch (action.type) {
    case "SET_POSTS":
      return { ...state, posts: action.payload };
    case "ADD_POST":
      return { ...state, posts: [action.payload, ...state.posts] };
    case "UPDATE_POST":
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
      };
    case "DELETE_POST":
      return {
        ...state,
        posts: state.posts.filter((post) => post._id !== action.payload),
      };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    default:
      return state;
  }
};

export const BlogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(blogReducer, {
    posts: [],
    categories: [],
  });

  const { callApi, loading, error } = useApi();

  const fetchPosts = async (page = 1) => {
    try {
      const response = await callApi(postService.getPosts, page);
      dispatch({ type: "SET_POSTS", payload: response.data.posts });
      return response.data;
    } catch (err) {
      // If API is down, set empty posts instead of crashing
      console.log("API not available, using empty posts");
      dispatch({ type: "SET_POSTS", payload: [] });
      return { posts: [], currentPage: 1, totalPages: 0, totalPosts: 0 };
    }
  };

  const createPost = async (postData) => {
    const response = await callApi(postService.createPost, postData);
    dispatch({ type: "ADD_POST", payload: response.data });
    return response.data;
  };

  const updatePost = async (id, postData) => {
    const response = await callApi(postService.updatePost, id, postData);
    dispatch({ type: "UPDATE_POST", payload: response.data });
    return response.data;
  };

  const deletePost = async (id) => {
    await callApi(postService.deletePost, id);
    dispatch({ type: "DELETE_POST", payload: id });
  };

  const value = {
    posts: state.posts,
    categories: state.categories,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    loading,
    error,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
};
