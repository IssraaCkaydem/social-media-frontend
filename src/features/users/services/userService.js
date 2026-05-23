import axiosClient from "../../../api/axiosClient"; 
export const searchUsers = (name) =>
  axiosClient.get(`/users2/search?name=${name}`).then(res => res.data);
 // 
 


export const getUserById = (id) =>
  axiosClient.get(`/users/${id}`).then(res => res.data);