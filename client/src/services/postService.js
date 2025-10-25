import API from "./api";

export const postService = {
  getPosts: (page = 1, limit = 10) =>
    API.get(`/posts?page=${page}&limit=${limit}`),

  getPost: (id) => API.get(`/posts/${id}`),

  createPost: (postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach((key) => {
      if (key === "categories" && Array.isArray(postData[key])) {
        postData[key].forEach((category) =>
          formData.append("categories", category)
        );
      } else {
        formData.append(key, postData[key]);
      }
    });
    return API.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updatePost: (id, postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach((key) => {
      if (key === "categories" && Array.isArray(postData[key])) {
        postData[key].forEach((category) =>
          formData.append("categories", category)
        );
      } else {
        formData.append(key, postData[key]);
      }
    });
    return API.put(`/posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePost: (id) => API.delete(`/posts/${id}`),
};
