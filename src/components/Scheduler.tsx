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

interface Process {
  name: string;
  burstTime: string;
  arrivalTime: string;
  priority: string;
  queueLevel: string;
  timeQuantum: string;
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", true);
  }, []);

  const addProcess = (process: Process) => {
    setProcesses([...processes, process]);
  };

  const handleAlgorithmChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAlgorithm(e.target.value);
  };

  const selectedAlgo = algorithms.find(a => a.value === algorithm);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <ToastContainer 
        position="top-right"
        theme="dark"
        toastClassName="bg-indigo-800 text-white"
      />

      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2" />
              <span className="text-sm font-medium text-blue-400">Operating Systems Simulator</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CPU Scheduler
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Visualize and compare different CPU scheduling algorithms in real-time
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Algorithm Selection Card */}
        <div className="mb-8 bg-indigo-800/40 backdrop-blur-sm border border-indigo-600/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-indigo-200 mb-2">
                Scheduling Algorithm
              </label>
              <select
                className="w-full bg-indigo-900/60 border border-indigo-600/40 text-white rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all cursor-pointer hover:bg-indigo-800/60"
                value={algorithm}
                onChange={handleAlgorithmChange}
              >
                {algorithms.map((algo) => (
                  <option key={algo.value} value={algo.value}>
                    {algo.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Algorithm Info Card */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-xl p-4 md:w-80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-pink-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-300 font-bold text-lg">{selectedAlgo?.abbr}</span>
                </div>
                <div>
                  <div className="text-xs text-indigo-300 uppercase tracking-wider">Selected</div>
                  <div className="text-sm font-semibold text-white">{selectedAlgo?.label}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Process Form Card */}
          <div className="bg-indigo-800/40 backdrop-blur-sm border border-indigo-600/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Add Process</h2>
            </div>
            <ProcessForm 
              processes={processes} 
              addProcess={addProcess} 
              algorithm={algorithm} 
            />
          </div>

          {/* Process Details Card */}
          <div className="bg-indigo-800/40 backdrop-blur-sm border border-indigo-600/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-400/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Process Queue</h2>
              </div>
              <div className="px-3 py-1 bg-purple-400/30 border border-purple-300/40 rounded-lg">
                <span className="text-sm font-medium text-purple-100">{processes.length} {processes.length === 1 ? 'process' : 'processes'}</span>
              </div>
            </div>
            <ProcessDetails 
              processes={processes} 
              setProcesses={setProcesses} 
            />
          </div>
        </div>

        {/* Visualization Section */}
        {processes.length > 0 && (
          <div className="bg-indigo-800/40 backdrop-blur-sm border border-indigo-600/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Gantt Chart & Analysis</h2>
            </div>
            
            <div className="bg-indigo-950/50 rounded-xl p-6 border border-indigo-700/30">
              {algorithm === "FCFS" && <FCFS processes={processes} />}
              {algorithm === "SJF" && <SJF processes={processes} />}
              {algorithm === "SRTF" && <SRJF processes={processes} />}
              {algorithm === "RR" && <RR processes={processes} />}
              {algorithm === "Priority (Non-Preemptive)" && <PriorityNonPreemptive processes={processes} />}
              {algorithm === "Priority (Preemptive)" && <PriorityScheduling processes={processes} />}
            </div>
          </div>
        )}

        {/* Empty State */}
        {processes.length === 0 && (
          <div className="bg-indigo-800/20 backdrop-blur-sm border border-indigo-600/30 border-dashed rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-700/40 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-indigo-200 mb-2">No processes added yet</h3>
            <p className="text-indigo-300">Add your first process to start the simulation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scheduler;