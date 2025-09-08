import React, { useEffect, useState } from "react";
import './Gallery.css';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import GalleryItem from "./GalleryItem";

function Gallery() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "files"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setFiles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  const handleFileDeleted = (deletedId) => {
    setFiles((prev) => prev.filter((f) => f.id !== deletedId));
  };

   return (
    <div className="gallery-container">
  <h2>Your Files</h2>
  {files.length === 0 && <p>No files uploaded yet.</p>}
  <div className="file-list">
    {files.map((file) => (
      <GalleryItem key={file.id} file={file} onDeleted={handleFileDeleted} />
    ))}
  </div>
</div>

  );
}

export default Gallery;