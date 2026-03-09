


import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import MessageBubble from "../components/MessageBubble";
import ChatHeader from "../components/ChatHeader"; // ✅ import ChatHeader
import { Box, InputBase, IconButton, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import socket from "../socket";

export default function Chat() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState(null);
  const [typing, setTyping] = useState(false);
  const [otherRecording, setOtherRecording] = useState(false);

  // Voice states
  const [recordState, setRecordState] = useState("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const load = async () => {
      const meRes = await axiosClient.get("/auth/me");
      setMe(meRes.data._id);

      const msgRes = await axiosClient.get(`/messages/${id}`);
      setMessages(msgRes.data);

      socket.emit("join", meRes.data._id);

      // 🔥 mark messages as seen
      await axiosClient.put(`/messages/seen/${id}`);
    };

    load();
  }, [id]);

  // =========================
  // SOCKET EVENTS
  // =========================
  useEffect(() => {
    const handleNewMessage = async (msg) => {
      setMessages(prev => [...prev, msg]);

      if (String(msg.senderId) === String(id)) {
        await axiosClient.put(`/messages/seen/${id}`);
        socket.emit("messagesSeen", { senderId: msg.senderId, receiverId: me });
      }
    };

    const handleDeleteMessage = msgId => setMessages(prev => prev.filter(m => m._id !== msgId));

    const handleTyping = senderId => {
      if (String(senderId) === String(id)) {
        setTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 1500);
      }
    };

    const handleRecording = senderId => { if (String(senderId) === String(id)) setOtherRecording(true); };
    const handleStopRecording = senderId => { if (String(senderId) === String(id)) setOtherRecording(false); };

    const handleSeen = ({ seenBy }) => {
      if (String(seenBy) === String(id)) {
        setMessages(prev =>
          prev.map(msg => String(msg.senderId) === String(me) ? { ...msg, seen: true } : msg)
        );
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("deleteMessage", handleDeleteMessage);
    socket.on("typing", handleTyping);
    socket.on("recording", handleRecording);
    socket.on("stopRecording", handleStopRecording);
    socket.on("messagesSeen", handleSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("deleteMessage", handleDeleteMessage);
      socket.off("typing", handleTyping);
      socket.off("recording", handleRecording);
      socket.off("stopRecording", handleStopRecording);
      socket.off("messagesSeen", handleSeen);
    };
  }, [id, me]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, otherRecording]);

  // =========================
  // SEND TEXT
  // =========================
  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await axiosClient.post("/messages", { receiverId: id, text });
    socket.emit("sendMessage", res.data);
    setMessages(prev => [...prev, res.data]);
    await axiosClient.put(`/messages/seen/${id}`);
    setText("");
  };

  const handleInputChange = e => {
    setText(e.target.value);
    if (me) socket.emit("typing", { senderId: me, receiverId: id });
  };

  // =========================
  // VOICE RECORDING
  // =========================
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    setRecordingTime(0);
    setRecordState("recording");
    if (me) socket.emit("recording", { senderId: me, receiverId: id });
    recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setRecordState("recorded");
      if (me) socket.emit("stopRecording", { senderId: me, receiverId: id });
    };
    recorder.start();
    timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
    }
  };

  const sendVoice = async () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], "voice.webm", { type: "audio/webm" });
    const formData = new FormData();
    formData.append("voice", file);
    formData.append("receiverId", id);

    const res = await axiosClient.post("/messages/voice", formData);
    socket.emit("sendMessage", res.data);
    setMessages(prev => [...prev, res.data]);
    resetRecording();
  };

  const cancelVoice = () => resetRecording();
  const resetRecording = () => { setAudioBlob(null); setRecordingTime(0); setRecordState("idle"); };
  console.log("Chat id param:", id);

  // =========================
  // UI
  // =========================
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>

      {/* ===== CHAT HEADER ===== */}
      <ChatHeader userId={id} />  {/* ✅ component for profile & name */}

      {/* ===== MESSAGES LIST ===== */}
      <Box sx={{ height: "70vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {messages.map(msg => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isMe={String(msg.senderId) === String(me)}
            onDeleteForMe={async id => {
              await axiosClient.delete(`/messages/me/${id}`);
              setMessages(prev => prev.filter(m => m._id !== id));
            }}
            onDeleteForEveryone={async id => {
              await axiosClient.delete(`/messages/everyone/${id}`);
              setMessages(prev => prev.filter(m => m._id !== id));
            }}
          />
        ))}

        {typing && <Typography sx={{ fontSize: 12, color: "#555", ml: 1 }}>Typing...</Typography>}
        {otherRecording && <Typography sx={{ fontSize: 12, color: "red", ml: 1 }}>🎤 Recording...</Typography>}
        <div ref={messagesEndRef} />
      </Box>

      {/* ===== RECORDING STATUS ===== */}
      {recordState === "recording" && <Typography sx={{ color: "red", fontSize: 14 }}>Recording... {recordingTime}s</Typography>}

      {recordState === "recorded" && audioBlob && (
        <Box sx={{ mb: 1 }}>
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <Box>
            <IconButton onClick={sendVoice}><SendIcon /></IconButton>
            <IconButton onClick={cancelVoice}>❌</IconButton>
          </Box>
        </Box>
      )}

      {/* ===== INPUT ===== */}
      <Box sx={{ display: "flex", mt: 1 }}>
        <InputBase
          value={text}
          onChange={handleInputChange}
          placeholder="Type a message..."
          sx={{ flex: 1, border: "1px solid #ccc", borderRadius: 1, px: 1 }}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        {recordState === "idle" && (
          <>
            <IconButton onClick={sendMessage}><SendIcon /></IconButton>
            <IconButton onClick={startRecording}><MicIcon /></IconButton>
          </>
        )}
        {recordState === "recording" && <IconButton onClick={stopRecording}><StopIcon /></IconButton>}
      </Box>
    </Box>
  );
}