import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null, // Only top-level comments
      isApproved: true,
    })
      .populate("author", "username avatar")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "username avatar",
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

// Create comment
export const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const commentData = {
      content,
      author: req.user.id,
      post: postId,
    };

    if (parentComment) {
      commentData.parentComment = parentComment;
    }

    const comment = await Comment.create(commentData);

    // Add comment to post's comments array
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    // If it's a reply, add to parent comment's replies
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id },
      });
    }

    // Populate author info
    await comment.populate("author", "username avatar");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      message: "Error creating comment",
      error: error.message,
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Check if user is author or admin
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to update this comment",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true, runValidators: true }
    ).populate("author", "username avatar");

    res.json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      message: "Error updating comment",
      error: error.message,
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Check if user is author or admin
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this comment",
      });
    }

    // Remove comment from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    // If it's a reply, remove from parent comment's replies
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    }

    // Delete the comment and its replies
    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

// Like/unlike comment
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const hasLiked = comment.likes.includes(req.user.id);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter(
        (like) => like.toString() !== req.user.id
      );
    } else {
      // Like
      comment.likes.push(req.user.id);
    }

    await comment.save();

    res.json({
      success: true,
      message: hasLiked ? "Comment unliked" : "Comment liked",
      likeCount: comment.likes.length,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({
      message: "Error updating like",
      error: error.message,
    });
  }
};
