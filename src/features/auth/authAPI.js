

import axiosClient from "../../api/axiosClient";

export const registerUser = (data) =>
  axiosClient.post("/auth/register", data).then(res => res.data);

export const loginUser = (data) =>
  axiosClient.post("/auth/login", data).then(res => res.data);

export const logoutUser = () =>
  axiosClient.post("/auth/logout").then(res => res.data);

export const getMe = () => {
    return axiosClient.get("/auth/me").then(res => res.data);
};

export const updateMe = (data) =>
  axiosClient.put("/users/me", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);