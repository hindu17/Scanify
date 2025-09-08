import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

import Auth from "./components/Auth";
import ScannerUploader from "./components/ScannerUploader";
import Gallery from "./components/Gallery";
import "./App.css"; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <BrowserRouter>
      <div>
        {/* 🔹 Navbar */}
        <header className="navbar">
          <div className="brand">📄 Scanify</div>

          {user ? (
            <nav className="nav-links">
              <span className="user">Welcome, {user.email}</span>
              <Link to="/upload">Upload</Link>
              <Link to="/gallery">Gallery</Link>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </nav>
          ) : (
            <p className="login-msg">Please log in or sign up</p>
          )}
        </header>

        {/* 🔹 Routes */}
        <main className="main-content">
          <Routes>
            <Route
              path="/auth"
              element={!user ? <Auth /> : <Navigate to="/upload" />}
            />
            <Route
              path="/upload"
              element={user ? <ScannerUploader /> : <Navigate to="/auth" />}
            />
            <Route
              path="/gallery"
              element={user ? <Gallery /> : <Navigate to="/auth" />}
            />
            <Route
              path="*"
              element={<Navigate to={user ? "/upload" : "/auth"} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
