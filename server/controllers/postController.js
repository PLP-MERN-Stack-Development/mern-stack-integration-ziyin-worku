import Post from "../models/Post.js";
import Category from "../models/Category.js";

// Get all posts with pagination and filtering
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, search, author } = req.query;

    // Build filter
    let filter = { isPublished: true };

    if (category) {
      const categoryDoc = await Category.findOne({
        name: new RegExp(category, "i"),
      });
      if (categoryDoc) {
        filter.categories = categoryDoc._id;
      }
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
      ];
    }

    if (author) {
      filter.author = author;
    }

    // Get posts with population
    const posts = await Post.find(filter)
      .populate("author", "username avatar")
      .populate("categories", "name color")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(filter);

    // Add virtuals to each post
    const postsWithCounts = posts.map((post) => ({
      ...post,
      commentCount: post.comments ? post.comments.length : 0,
      likeCount: post.likes ? post.likes.length : 0,
    }));

    res.json({
      success: true,
      posts: postsWithCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

// Get single post
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar bio")
      .populate("categories", "name color")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username avatar",
        },
      });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    // Add virtuals
    const postWithCounts = {
      ...post.toObject(),
      commentCount: post.comments.length,
      likeCount: post.likes.length,
    };

    res.json({
      success: true,
      post: postWithCounts,
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      message: "Error fetching post",
      error: error.message,
    });
  }
};

// Create new post
export const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, categories, tags, isPublished } = req.body;

    const postData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      author: req.user.id,
      isPublished: isPublished !== undefined ? isPublished : true,
    };

    if (categories) {
      postData.categories = Array.isArray(categories)
        ? categories
        : [categories];
    }

    if (tags) {
      postData.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());
    }

    if (req.file) {
      postData.featuredImage = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create(postData);

    // Populate author and categories
    await post.populate("author", "username avatar");
    await post.populate("categories", "name color");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      message: "Error creating post",
      error: error.message,
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to update this post",
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.featuredImage = `/uploads/${req.file.filename}`;
    }

    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((tag) => tag.trim());
    }

    post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("author", "username avatar")
      .populate("categories", "name color");

    res.json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      message: "Error updating post",
      error: error.message,
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to delete this post",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      message: "Error deleting post",
      error: error.message,
    });
  }
};

// Like/unlike post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const hasLiked = post.likes.includes(req.user.id);

    if (hasLiked) {
      // Unlike
      post.likes = post.likes.filter((like) => like.toString() !== req.user.id);
    } else {
      // Like
      post.likes.push(req.user.id);
    }

    await post.save();

    res.json({
      success: true,
      message: hasLiked ? "Post unliked" : "Post liked",
      likeCount: post.likes.length,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({
      message: "Error updating like",
      error: error.message,
    });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { author: req.params.userId };

    if (req.user?.id !== req.params.userId) {
      filter.isPublished = true;
    }

    const posts = await Post.find(filter)
      .populate("author", "username avatar")
      .populate("categories", "name color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(filter);

    const postsWithCounts = posts.map((post) => ({
      ...post,
      commentCount: post.comments ? post.comments.length : 0,
      likeCount: post.likes ? post.likes.length : 0,
    }));

    res.json({
      success: true,
      posts: postsWithCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      message: "Error fetching user posts",
      error: error.message,
    });
  }
};
