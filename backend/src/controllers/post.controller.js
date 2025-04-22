import Post from "../models/post.model.js";

// Get all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'fullName profilePic')
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getPosts: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new post
export const createPost = async (req, res) => {
  try {
    const { title, description, budget, deadline, skills, category } = req.body;
    
    const newPost = new Post({
      title,
      description,
      budget,
      deadline,
      skills,
      author: req.user._id, // Will be set by auth middleware
      category // Added category
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'fullName profilePic');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error in createPost: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName profilePic');
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in getPostById: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
