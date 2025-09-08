import React from "react";
import './Gallery.css';

import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function GalleryItem({ file, onDeleted }) {
  const handleDelete = async () => {
    if (!window.confirm(`Delete ${file.name}?`)) return;

    try {
      await deleteDoc(doc(db, "files", file.id));
      if (onDeleted) onDeleted(file.id);
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("❌ Failed to delete file");
    }
  };

    return (
    <div className="file-card">
    <h3>{file.name}</h3>
    <p>Uploaded: {new Date(file.createdAt.seconds * 1000).toLocaleString()}</p>

    <div className="image-section">
      <h4>Original</h4>
      {file.originalUrl ? (
        <img src={file.originalUrl} alt="Original" />
      ) : (
        <p>No original preview</p>
      )}
    </div>

    <div className="image-section">
      <h4>Processed</h4>
      {file.processedUrl ? (
        <img src={file.processedUrl} alt="Processed" />
      ) : (
        <p>No processed preview</p>
      )}
    </div>

        <button className="delete-btn" onClick={handleDelete}>🗑️ Delete</button>
      </div>
        );
    }

export default GalleryItem;