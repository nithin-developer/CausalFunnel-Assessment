import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Sessions from "./pages/Sessions";
import Heatmap from "./pages/Heatmap";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background bg-grid-pattern font-sans text-foreground">
        <Header />

        <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 relative z-10 flex flex-col">
          <div className="flex-1 flex flex-col space-y-8 h-full">
            <Routes>
              <Route path="/" index element={<Home />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/heatmap" element={<Heatmap />} />
            </Routes>
          </div>
        </main>

        <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
          <div className="max-w-[1200px] mx-auto px-6 text-center text-sm text-gray-500">
            <p>
              Designed and Developed with ❤️ by{" "}
              <a
                className="hover:text-emerald-600 transition-colors"
                href="https://github.com/nithin-developer"
              >
                Nithin
              </a>{" "}
              | All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
