import React, { useState } from "react";
const BASE_URL = "http://localhost:5000";

export default function AvatarPicker({ valueUrl, onFile }) {
  const [preview, setPreview] = useState(valueUrl || "");

  return (
    <div className="um-avatar-picker">
      <div className="um-avatar-circle">
        {preview ? (
          <img
            src={preview.startsWith("http") ? preview : `${BASE_URL}${preview}`}
            alt="avatar"
          />
        ) : (
          "🤖"
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setPreview(URL.createObjectURL(file)); // runtime preview
            onFile && onFile(file);               // backend upload
          }
        }}
      />
    </div>
  );
}
