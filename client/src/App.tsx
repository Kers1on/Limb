import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/auth";
import Profile from "./pages/profile";
import Chat from "./pages/chat";
import { useMatrix } from "@/lib/matrixContext";
import { ReactNode } from "react";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { client } = useMatrix();
  const isAuthenticated = !!client;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { client } = useMatrix();
  const isAuthenticated = !!client;
  return isAuthenticated ? <Navigate to="/chat" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
