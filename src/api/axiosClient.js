<<<<<<< HEAD

// src/api/axiosClient.js
/*
=======
// src/api/axiosClient.js
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:4000/api", // رابط الباكند
  withCredentials: true, // مهم للـ cookies
});

<<<<<<< HEAD
// ===== Axios Response Interceptor =====
axiosClient.interceptors.response.use(
  response => response, // إذا ما في error → رجع response
  async error => {
    const originalRequest = error.config;

    // إذا response status = 401 (Unauthorized) ولم نجرب التجديد بعد
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // حاول تجديد accessToken
        await axiosClient.post("/auth/refresh");
        // أعد تنفيذ الطلب الأصلي بعد التجديد
        return axiosClient(originalRequest);
      } catch (err) {
        // إذا التجديد فشل → reject error
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
*/
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

let isRefreshing = false;

axiosClient.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    // ❌ إذا refresh نفسه فشل → وقفي
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await axiosClient.post("/auth/refresh");
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        // 🔴 refresh فشل → رجّعي user عالـ login
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

=======
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
export default axiosClient;
