import { useEffect } from "react";
import Scheduler from "./components/Scheduler";
import GitHubFooter from "./components/GitHubFooter";
import "@/styles/globals.css";

const App: React.FC = () => {
  useEffect(() => {
    document.title = "CPU Scheduler";
  }, []);

  return (
    <div className="bg-black">
      <div className="m-auto p-6 bg-black">
        <Scheduler />
      </div>
      <GitHubFooter />
    </div>
  );
};

export default App;