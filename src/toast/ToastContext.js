import React, { createContext, useContext } from "react";
import { toast } from "react-hot-toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = (id, message, options = {}) => {
    toast(message, { id, ...options });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);