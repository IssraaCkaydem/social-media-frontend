

import React, { useState, useCallback, memo } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

const AddCommentInput = memo(({ onAdd }) => {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const isRtl = i18n.language === "ar";

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault(); 
    
    const trimmedText = text.trim();
    if (!trimmedText || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAdd(trimmedText); 
      setText(""); 
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [text, onAdd, isSubmitting]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <Box
      component="form" 
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mt: 1,
        width: "100%",
        direction: isRtl ? "rtl" : "ltr"
      }}
    >
      <TextField
        size="small"
        fullWidth
        placeholder={t("addComment")}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown} 
        disabled={isSubmitting}
        slotProps={{
          htmlInput: {
            style: { textAlign: isRtl ? "right" : "left" }
          }
        }}
      />

      <Button 
        variant="contained" 
        type="submit"
        disabled={!text.trim() || isSubmitting} 
        sx={{ 
          minWidth: "80px",
          height: "40px",
          whiteSpace: "nowrap"
        }}
      >
        {isSubmitting ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          t("post")
        )}
      </Button>
    </Box>
  );
});

AddCommentInput.displayName = "AddCommentInput";

export default AddCommentInput;