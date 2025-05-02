import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { MatrixProvider } from "@/lib/matrixContext";

createRoot(document.getElementById("root")!).render(
  <MatrixProvider>
    <App />
    <Toaster closeButton />
  </MatrixProvider>
);
