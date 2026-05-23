import axiosClient from "../../../api/axiosClient";

export const getFollowers = (id) =>
  axiosClient.get(`/follow/${id}/followers`).then(res => res.data);

export const getFollowing = (id) =>
  axiosClient.get(`/follow/${id}/following`).then(res => res.data);