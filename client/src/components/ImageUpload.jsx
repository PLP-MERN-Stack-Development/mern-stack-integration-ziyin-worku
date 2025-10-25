import React, { useState } from "react";

const ImageUpload = ({ onImageChange, currentImage }) => {
  const [preview, setPreview] = useState(currentImage || "");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    }
  };

  return (
    <div className="image-upload">
      {preview && <img src={preview} alt="Preview" className="image-preview" />}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />
    </div>
  );
};

export default ImageUpload;
