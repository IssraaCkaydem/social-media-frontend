import axiosClient from "../../../api/axiosClient"; 

export const getMessages = (id) =>
  axiosClient.get(`/messages/${id}`).then(res => res.data);

export const sendMessage = (data) =>
  axiosClient.post("/messages", data).then(res => res.data);

export const sendVoiceMessage = (formData) =>
  axiosClient.post("/messages/voice", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);

export const markMessagesSeen = (id) =>
  axiosClient.put(`/messages/seen/${id}`).then(res => res.data);

export const getInboxUsers = () =>
  axiosClient.get("/messages/users").then(res => res.data);

export const deleteForMe = (messageId) =>
  axiosClient.delete(`/messages/me/${messageId}`).then(res => res.data);

export const deleteForEveryone = (messageId) =>
  axiosClient.delete(`/messages/everyone/${messageId}`).then(res => res.data);