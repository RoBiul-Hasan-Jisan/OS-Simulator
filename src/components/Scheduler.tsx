import { useState, useEffect, ChangeEvent } from "react";
import ProcessForm from "./ProcessForm";
import SRJF from "./SRJF";
import FCFS from "./FCFS";
import RR from "./RR";
import PriorityNonPreemptive from "./PriorityNonPreemptive";
import PriorityScheduling from "./PriorityScheduling";
import ProcessDetails from "./ProcessDetails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SJF from "./SJF";

// Base interface that all components should extend
interface BaseProcess {
  name: string;
  arrivalTime: string | number;
  burstTime: string | number;
  priority: string | number;
  queueLevel?: string;
  timeQuantum?: string;
}

// For ProcessForm - expects string values
export interface ProcessFormData extends Omit<BaseProcess, 'arrivalTime' | 'burstTime' | 'priority'> {
  arrivalTime: string;
  burstTime: string;
  priority: string;
}

// For ProcessDetails - expects string values
export interface ProcessDetailsData extends Omit<BaseProcess, 'arrivalTime' | 'burstTime' | 'priority'> {
  arrivalTime: string;
  burstTime: string;
  priority: string;
}

// For scheduling algorithms - expects number values
export interface Process extends Omit<BaseProcess, 'arrivalTime' | 'burstTime' | 'priority'> {
  arrivalTime: number;
  burstTime: number;
  priority: number;
}

const algorithms = [
  { value: "FCFS", label: "First Come First Serve", abbr: "FCFS" },
  { value: "SJF", label: "Shortest Job First", abbr: "SJF" },
  { value: "SRTF", label: "Shortest Remaining Time First", abbr: "SRTF" },
  { value: "RR", label: "Round Robin", abbr: "RR" },
  { value: "Priority (Non-Preemptive)", label: "Priority (Non-Preemptive)", abbr: "PNP" },
  { value: "Priority (Preemptive)", label: "Priority (Preemptive)", abbr: "PP" },
];

const Scheduler = () => {
  const [algorithm, setAlgorithm] = useState<string>("FCFS");
  const [processes, setProcesses] = useState<Process[]>([]);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const addProcess = (processData: ProcessFormData) => {
    // Convert string inputs to numbers
    const newProcess: Process = {
      name: processData.name,
      arrivalTime: parseInt(processData.arrivalTime) || 0,
      burstTime: parseInt(processData.burstTime) || 1,
      priority: parseInt(processData.priority) || 1,
      queueLevel: processData.queueLevel,
      timeQuantum: processData.timeQuantum,
    };
    setProcesses([...processes, newProcess]);
  };

  const handleAlgorithmChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAlgorithm(e.target.value);
  };

  const selectedAlgo = algorithms.find(a => a.value === algorithm);

  const clearAllProcesses = () => {
    setProcesses([]);
  };

  // Convert processes to ProcessFormData format
  const processFormData: ProcessFormData[] = processes.map(process => ({
    name: process.name,
    arrivalTime: process.arrivalTime.toString(),
    burstTime: process.burstTime.toString(),
    priority: process.priority.toString(),
    queueLevel: process.queueLevel || "",
    timeQuantum: process.timeQuantum || "",
  }));

  // Convert processes to ProcessDetailsData format
  const processDetailsData: ProcessDetailsData[] = processes.map(process => ({
    name: process.name,
    arrivalTime: process.arrivalTime.toString(),
    burstTime: process.burstTime.toString(),
    priority: process.priority.toString(),
    queueLevel: process.queueLevel || "",
    timeQuantum: process.timeQuantum || "",
  }));

  // For ProcessDetails setProcesses callback
  const updateProcesses = (updatedProcesses: ProcessDetailsData[]) => {
    const convertedProcesses: Process[] = updatedProcesses.map(process => ({
      name: process.name,
      arrivalTime: parseInt(process.arrivalTime) || 0,
      burstTime: parseInt(process.burstTime) || 1,
      priority: parseInt(process.priority) || 1,
      queueLevel: process.queueLevel,
      timeQuantum: process.timeQuantum,
    }));
    setProcesses(convertedProcesses);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          letter-spacing: -0.01em;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric-card {
          position: relative;
          overflow: hidden;
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), transparent);
        }

        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 40px -10px rgba(96, 165, 250, 0.4);
        }

        .btn-secondary {
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 3rem;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .status-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgb(34, 197, 94);
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
        }

        .status-indicator.inactive {
          background: rgb(161, 161, 170);
          box-shadow: 0 0 0 2px rgba(161, 161, 170, 0.2);
        }
      `}</style>

      <ToastContainer 
        position="top-right"
        theme={darkMode ? "dark" : "light"}
        toastClassName="backdrop-blur-xl"
      />

      {/* Minimal Header */}
      <header className="sticky top-0 z-50 glass-card">
        <div className="max-w-[1400px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                  CPU Scheduler
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Process scheduling simulation and analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                className="h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer min-w-[280px]"
                value={algorithm}
                onChange={handleAlgorithmChange}
              >
                {algorithms.map((algo) => (
                  <option key={algo.value} value={algo.value}>
                    {algo.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="h-10 px-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-colors"
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-10">
        {/* Metrics Dashboard */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className="metric-card bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 min-h-[140px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Algorithm
              </span>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
                {selectedAlgo?.abbr}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {selectedAlgo?.label}
              </div>
            </div>
          </div>

          <div className="metric-card bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 min-h-[140px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Queue Size
              </span>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
                {processes.length}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {processes.length === 1 ? 'Process' : 'Processes'} ready
              </div>
            </div>
          </div>

          <div className="metric-card bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 min-h-[140px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Status
              </span>
              <div className={`status-indicator ${processes.length > 0 ? '' : 'inactive'}`} />
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
                {processes.length > 0 ? 'Active' : 'Idle'}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {processes.length > 0 ? 'Ready to simulate' : 'Add processes'}
              </div>
            </div>
          </div>

          <div className="metric-card bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Actions
              </span>
            </div>
            <button
              onClick={clearAllProcesses}
              disabled={processes.length === 0}
              className="w-full h-11 px-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear Queue
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {/* Process Input */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Create Process
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Define process attributes and scheduling parameters
              </p>
            </div>
            <div className="p-6">
              <ProcessForm 
                processes={processFormData} 
                addProcess={addProcess} 
                algorithm={algorithm} 
              />
            </div>
          </div>

          {/* Process List */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Process Queue
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {processes.length} {processes.length === 1 ? 'process' : 'processes'} in queue
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ProcessDetails 
                processes={processDetailsData} 
                setProcesses={updateProcesses} 
              />
            </div>
          </div>
        </div>

        {/* Visualization Section */}
        {processes.length > 0 ? (
          <div className="animate-in bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Simulation & Analysis
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Gantt chart visualization and performance metrics
              </p>
            </div>
            <div className="p-6">
              {algorithm === "FCFS" && <FCFS processes={processes} />}
              {algorithm === "SJF" && <SJF processes={processes} />}
              {algorithm === "SRTF" && <SRJF processes={processes} />}
              {algorithm === "RR" && <RR processes={processes} />}
              {algorithm === "Priority (Non-Preemptive)" && <PriorityNonPreemptive processes={processes} />}
              {algorithm === "Priority (Preemptive)" && <PriorityScheduling processes={processes} />}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-20">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mx-auto mb-6 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 rounded" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                No Active Processes
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Add processes to the queue to begin simulation and view performance analysis
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-20">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <p>CPU Scheduling Algorithm Simulator</p>
            <p>Operating Systems · Process Management</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Scheduler;