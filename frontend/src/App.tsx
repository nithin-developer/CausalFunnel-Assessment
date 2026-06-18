import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sessions from "./pages/Sessions";
import Heatmap from "./pages/Heatmap";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background bg-grid-pattern font-sans text-foreground">
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 relative z-10">
          <div className="flex flex-col space-y-8">
            <Routes>
              <Route path="/" element={<Sessions />} />
              <Route path="/heatmap" element={<Heatmap />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
