import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Scheduler from "./components/Scheduler";
import Doc from "./components/doc";
import GitHubFooter from "./components/GitHubFooter";
import "@/styles/globals.css";

const App: React.FC = () => {
  useEffect(() => {
    document.title = "CPU Scheduler";
  }, []);

  return (
    <Router>
      <div className="bg-black min-h-screen">
        <Routes>
          {/* Main Scheduler Page */}
          <Route 
            path="/" 
            element={
              <>
                <div className="m-auto p-6 bg-black">
                  <Scheduler />
                </div>
                <GitHubFooter />
              </>
            } 
          />
          
          {/* Documentation Page */}
          <Route 
            path="/doc" 
            element={
              <>
                <Doc />
                <GitHubFooter />
              </>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;