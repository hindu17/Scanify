import React, { useState } from "react";
import './ScannerUploader.css';
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Use Vite-compatible worker from pdfjs-dist package
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js`;

function ScannerUploader() {
  const [file, setFile] = useState(null);
  const [croppedDataURL, setCroppedDataURL] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setCroppedDataURL(null); 
  };

  // Auto-crop canvas
  const autoCropCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const imgData = ctx.getImageData(0, 0, width, height).data;

    let top = height, left = width, right = 0, bottom = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = imgData[i], g = imgData[i+1], b = imgData[i+2];
        if (!(r > 240 && g > 240 && b > 240)) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }

    const croppedWidth = right - left + 1;
    const croppedHeight = bottom - top + 1;
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
    croppedCanvas.getContext("2d").drawImage(canvas, left, top, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);

    return croppedCanvas;
  };

  // Convert PDF to cropped image
  const pdfToImage = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;

    const croppedCanvas = autoCropCanvas(canvas);
    return croppedCanvas.toDataURL("image/png");
  };

  // Convert image file to cropped base64
  const fileToBase64 = async (file) => {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = document.createElement("img");
    img.src = base64;
    await new Promise(res => (img.onload = res));

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);

    const croppedCanvas = autoCropCanvas(canvas);
    return croppedCanvas.toDataURL("image/png");
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    try {
      let base64Data;
      if (file.type === "application/pdf") {
        base64Data = await pdfToImage(file);
      } else {
        base64Data = await fileToBase64(file);
      }

      setCroppedDataURL(base64Data); // show "after" preview

      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      await addDoc(collection(db, "files"), {
      userId: user.uid,
      name: file.name,
      originalUrl: URL.createObjectURL(file), //  original file preview
      processedUrl: base64Data,               //  cropped version
      createdAt: serverTimestamp(),
    });


      alert("✅ File uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader-container">
      <h2>Upload Image or PDF</h2>
      <div className="file-input-wrapper">
        <label className="file-label">
          Choose File
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
        </label>
        <button className="upload-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {file && (
        <div className="preview-container">
          <div className="preview-box">
            <h4>Before</h4>
            <img src={URL.createObjectURL(file)} alt="Before" />
          </div>
          {croppedDataURL && (
            <div className="preview-box">
              <h4>After (Cropped)</h4>
              <img src={croppedDataURL} alt="After" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ScannerUploader;
