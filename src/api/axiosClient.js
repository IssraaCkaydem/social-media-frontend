



import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await axiosClient.post("/auth/refresh");
        return axiosClient(originalRequest);
      } catch (e) {
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  }
);

export default axiosClient;
     