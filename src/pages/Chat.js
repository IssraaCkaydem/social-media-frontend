


import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box, InputBase, IconButton, CircularProgress, Typography,
} from "@mui/material";
import {
  Send as SendIcon, Mic as MicIcon, Stop as StopIcon,
  Delete as DeleteIcon, Image as ImageIcon
} from "@mui/icons-material";

import axiosClient from '../api/axiosClient';
import socket from "../socket";
import { 
  getMessages, sendMessage, sendVoiceMessage, markMessagesSeen, 
  deleteForMe, deleteForEveryone, ChatHeader, MessageBubble 
} from "../features/chat";

export default function Chat() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const me = user?._id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingMe, setIsRecordingMe] = useState(false);
  const [isRecordingUser, setIsRecordingUser] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioPreview, setAudioPreview] = useState(null);

  const typingTimeout = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordInterval = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleMarkAsSeen = useCallback(async () => {
    if (!id || !me || !document.hasFocus()) return;
    try {
      await markMessagesSeen(id);
      socket.emit("messagesSeen", { senderId: id, receiverId: me });
    } catch (err) {
      console.error("Seen Error:", err);
    }
  }, [id, me]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getMessages(id);
        setMessages(res || []);
        handleMarkAsSeen();
      } catch (err) {
        console.error("Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (me && id) load();
  }, [id, me, handleMarkAsSeen]);

  const cancelImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleTyping = useCallback((value) => {
    setText(value);
    socket.emit("typing", { senderId: me, receiverId: id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { senderId: me, receiverId: id });
    }, 1500);
  }, [id, me]);

  const sendMsg = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText && !selectedImage) return;
    try {
      let resData;
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("receiverId", id);
        formData.append("text", trimmedText);
        const response = await axiosClient.post("/messages/image", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        });
        resData = response.data;
      } else {
        resData = await sendMessage({ receiverId: id, text: trimmedText });
      }

      socket.emit("sendMessage", resData);
      setMessages((prev) => (prev.some(m => m._id === resData._id) ? prev : [...prev, resData]));
      setText("");
      cancelImage();
    } catch (err) {
      console.error("Send Error:", err);
    }
  }, [id, text, selectedImage, cancelImage]);

  useEffect(() => {
    const onNewMessage = (msg) => {
      if (msg.senderId === id || msg.receiverId === id) {
        if (msg.senderId === id) setIsRecordingUser(false);
        setMessages((prev) => (prev.some(m => m._id === msg._id) ? prev : [...prev, msg]));
        
        if (msg.senderId === id && document.hasFocus()) {
          handleMarkAsSeen();
        }
      }
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messagesSeen", ({ readerId }) => {
      if (readerId === id) {
        setMessages((prev) => prev.map((m) => m.senderId === me ? { ...m, seen: true } : m));
      }
    });
    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });
    socket.on("typing", ({ senderId }) => senderId === id && setIsTyping(true));
    socket.on("stopTyping", ({ senderId }) => senderId === id && setIsTyping(false));
    socket.on("recording", ({ senderId }) => senderId === id && setIsRecordingUser(true));
    socket.on("stopRecording", ({ senderId }) => senderId === id && setIsRecordingUser(false));

    return () => {
      socket.off("newMessage");
      socket.off("messagesSeen");
      socket.off("messageDeleted");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("recording");
      socket.off("stopRecording");
    };
  }, [id, me, handleMarkAsSeen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioPreview({ blob, url: URL.createObjectURL(blob) });
      };
      mediaRecorder.start();
      setRecordTime(0);
      recordInterval.current = setInterval(() => setRecordTime((p) => p + 1), 1000);
      setIsRecordingMe(true);
      socket.emit("recording", { senderId: me, receiverId: id });
    } catch (err) { console.error(err); }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingMe) {
      mediaRecorderRef.current.stop();
      clearInterval(recordInterval.current);
      setIsRecordingMe(false);
      socket.emit("stopRecording", { senderId: me, receiverId: id });
    }
  }, [id, me, isRecordingMe]);

  const sendVoice = useCallback(async () => {
    if (!audioPreview) return;
    try {
      const formData = new FormData();
      formData.append("voice", audioPreview.blob);
      formData.append("receiverId", id);
      const res = await sendVoiceMessage(formData);
      socket.emit("stopRecording", { senderId: me, receiverId: id });
      socket.emit("sendMessage", res);
      setMessages((prev) => (prev.some(m => m._id === res._id) ? prev : [...prev, res]));
      setAudioPreview(null);
    } catch (err) { console.error(err); }
  }, [id, me, audioPreview]);

  useEffect(() => {
    window.addEventListener("focus", handleMarkAsSeen);
    return () => window.removeEventListener("focus", handleMarkAsSeen);
  }, [handleMarkAsSeen]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 2, display: 'flex', flexDirection: 'column', height: '90vh' }}>
      <ChatHeader userId={id} onClearChat={async () => {
          await axiosClient.delete(`/messages/clear/${id}`);
          setMessages([]);
      }} />

      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2, bgcolor: '#f5f5f5', borderRadius: 2, my: 1 }}>
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            message={m}
            isMe={m.senderId === me}
            onDeleteForMe={(mId) => { deleteForMe(mId); setMessages(p => p.filter(msg => msg._id !== mId)); }}
            onDeleteForEveryone={(mId) => { deleteForEveryone(mId); setMessages(p => p.filter(msg => msg._id !== mId)); }}
          />
        ))}
        <div ref={scrollRef} style={{ float: "left", clear: "both" }} />
      </Box>

      <Box sx={{ px: 2, height: 20 }}>
        {isTyping && <Typography variant="caption" color="primary">Typing...</Typography>}
        {isRecordingUser && <Typography variant="caption" color="error">🎤 Recording voice...</Typography>}
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid #ddd' }}>
        {imagePreview && (
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
            <img src={imagePreview} alt="preview" style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover' }} />
            <IconButton size="small" onClick={cancelImage} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'error.main', color: 'white' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {audioPreview && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, p: 1, bgcolor: '#eee', borderRadius: 2 }}>
            <audio src={audioPreview.url} controls style={{ height: 30 }} />
            <IconButton color="success" onClick={sendVoice}><SendIcon /></IconButton>
            <IconButton color="error" onClick={() => { setAudioPreview(null); socket.emit("stopRecording", { senderId: me, receiverId: id }); }}><DeleteIcon /></IconButton>
          </Box>
        )}
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
          <IconButton onClick={() => fileInputRef.current.click()}><ImageIcon /></IconButton>
          <InputBase
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            fullWidth
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMsg()}
            sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 2, px: 2 }}
          />
          {(text.trim() || selectedImage) ? (
            <IconButton onClick={sendMsg} color="primary"><SendIcon /></IconButton>
          ) : isRecordingMe ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
               <Typography variant="caption" sx={{ mr: 1 }}>{recordTime}s</Typography>
               <IconButton color="error" onClick={stopRecording}><StopIcon /></IconButton>
            </Box>
          ) : (
            <IconButton onClick={startRecording}><MicIcon /></IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}