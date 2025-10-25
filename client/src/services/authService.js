import API from "./api";

export const authService = {
  register: (userData) => API.post("/auth/register", userData),

  login: (email, password) => API.post("/auth/login", { email, password }),

  getMe: () => API.get("/auth/me"),
};
