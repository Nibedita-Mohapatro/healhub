import React, { useState } from "react";

/**
 * ImageUpload
 * Props:
 *   onFileSelected(base64String, file)
 *   accept (e.g. "image/*")
 *   previewUrl (optional)
 */
export default function ImageUpload({ onFileSelected = () => {}, accept = "image/*", previewUrl = null }) {
  const [preview, setPreview] = useState(previewUrl);

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      onFileSelected(base64, file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <label className="w-36 h-36 rounded overflow-hidden border flex items-center justify-center bg-gray-50 dark:bg-gray-700 cursor-pointer">
        {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <div className="text-xs text-gray-500">Choose image</div>}
        <input type="file" accept={accept} onChange={handleFile} className="hidden" />
      </label>
      <div className="flex-1">
        <div className="text-sm text-gray-600 dark:text-gray-300">Supported: JPG, PNG — keep small for local storage</div>
      </div>
    </div>
  );
}
