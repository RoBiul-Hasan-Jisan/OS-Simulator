import { useState, useEffect, useCallback } from "react";

interface Process {
  name: string;
  burstTime: number;
  arrivalTime: number;
  remainingTime?: number;
}

interface ProcessStats {
  arrivalTime: number;
  burstTime: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
}

interface GanttChartEntry {
  name: string;
  startTime: number;
  endTime: number;
  quantum?: number;
  isComplete?: boolean;
  isIdle?: boolean;
}

interface SimulationState {
  initialized: boolean;
  executingProcess: Process | null;
  processStartTime: number | null;
  processEndTime: number | null;
  executionProgress: number;
}

interface RoundRobinProps {
  processes: Process[];
  timeQuantum?: number;
}

const processColors: Record<string, string> = {
  P1: "#FF5733",
  P2: "#33FF57",
  P3: "#3357FF",
  P4: "#FF33A8",
  P5: "#33FFF9",
  P6: "#FFD700",
  P7: "#FF69B4",
  P8: "#00CED1",
  P9: "#FF4500",
  P10: "#9370DB",
};

const RoundRobin = ({ processes, timeQuantum: initialTimeQuantum = 2 }: RoundRobinProps) => {
  const [pendingProcesses, setPendingProcesses] = useState<Process[]>([]);
  const [readyQueue, setReadyQueue] = useState<Process[]>([]);
  const [completedProcesses, setCompletedProcesses] = useState<Process[]>([]);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
  const [ganttChart, setGanttChart] = useState<GanttChartEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [animatingTimeJump, setAnimatingTimeJump] = useState(false);
  const [timeJumpTarget, setTimeJumpTarget] = useState(0);
  const [remainingTime, setRemainingTime] = useState<Record<string, number>>({});
  const [quantumProgress, setQuantumProgress] = useState(0);
  const [enteringProcess, setEnteringProcess] = useState<string | null>(null);
  const [exitingProcess, setExitingProcess] = useState<string | null>(null);
  const [timeQuantum, setTimeQuantum] = useState(initialTimeQuantum);
  const [simulationState, setSimulationState] = useState<SimulationState>({
    initialized: false,
    executingProcess: null,
    processStartTime: null,
    processEndTime: null,
    executionProgress: 0
  });

  // Initialize simulation
  const startSimulation = useCallback(() => {
    if (!simulationState.initialized) {
      // Sort processes by arrival time
      const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
      
      // Create processes with remaining time
      const processesWithRemaining = sortedProcesses.map(p => ({
        ...p,
        remainingTime: p.burstTime,
      }));
      
      // Initialize remaining time
      const initialRemaining: Record<string, number> = {};
      processesWithRemaining.forEach(p => {
        initialRemaining[p.name] = p.burstTime;
      });
      
      setRemainingTime(initialRemaining);
      setPendingProcesses([...processesWithRemaining]);
      setReadyQueue([]);
      setCompletedProcesses([]);
      setGanttChart([]);
      setCurrentProcess(null);
      setCurrentTime(0);
      setAnimatingTimeJump(false);
      setTimeJumpTarget(0);
      setQuantumProgress(0);
      setSimulationState({
        initialized: true,
        executingProcess: null,
        processStartTime: null,
        processEndTime: null,
        executionProgress: 0
      });
    }
    setIsSimulating(true);
    setIsPaused(false);
  }, [processes, simulationState.initialized]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    setIsPaused(true);
  }, []);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setPendingProcesses([]);
    setReadyQueue([]);
    setCompletedProcesses([]);
    setGanttChart([]);
    setCurrentProcess(null);
    setCurrentTime(0);
    setAnimatingTimeJump(false);
    setTimeJumpTarget(0);
    setQuantumProgress(0);
    setIsSimulating(false);
    setIsPaused(false);
    setSimulationState({
      initialized: false,
      executingProcess: null,
      processStartTime: null,
      processEndTime: null,
      executionProgress: 0
    });
  }, []);

  // Calculate delay based on animation speed
  const getAnimationDelay = useCallback((baseDelay: number) => {
    return baseDelay / animationSpeed;
  }, [animationSpeed]);

  // Handle simulation steps
  useEffect(() => {
    if (!isSimulating || isPaused) return;

    let isMounted = true;

    const simulationStep = async () => {
      if (!isMounted) return;

      // Check for new arrivals
      const newArrivals = pendingProcesses.filter(p => p.arrivalTime <= currentTime);
      
      if (newArrivals.length > 0) {
        // Animate new arrivals entering ready queue
        for (const process of newArrivals) {
          if (!isMounted) break;
          setEnteringProcess(process.name);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
          setEnteringProcess(null);
        }
        
        if (isMounted) {
          // Update queues
          setPendingProcesses(prev => prev.filter(p => p.arrivalTime > currentTime));
          setReadyQueue(prev => [...prev, ...newArrivals]);
        }
      }

      // If CPU is idle and ready queue has processes
      if (isMounted && !currentProcess && readyQueue.length > 0) {
        // Get next process from ready queue (FIFO)
        const nextProcess = readyQueue[0];
        setCurrentProcess(nextProcess);
        setQuantumProgress(0);
        
        // Remove from ready queue
        setReadyQueue(prev => prev.slice(1));
        
        // Calculate execution time (minimum of quantum or remaining time)
        const executeTime = Math.min(timeQuantum, remainingTime[nextProcess.name] || 0);
        
        // Create Gantt entry
        const ganttEntry: GanttChartEntry = {
          name: nextProcess.name,
          startTime: currentTime,
          endTime: currentTime + executeTime,
          quantum: executeTime,
          isComplete: ((remainingTime[nextProcess.name] || 0) - executeTime) <= 0
        };
        
        // Animate execution
        setAnimatingTimeJump(true);
        setTimeJumpTarget(currentTime + executeTime);
        
        for (let t = 1; t <= executeTime; t++) {
          if (!isMounted || !isSimulating || isPaused) break;
          setQuantumProgress((t / executeTime) * 100);
          setCurrentTime(prev => prev + 1);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
        }
        
        if (!isMounted) return;
        
        setAnimatingTimeJump(false);
        setQuantumProgress(0);
        
        // Update Gantt chart
        setGanttChart(prev => [...prev, ganttEntry]);
        
        // Update remaining time
        const newRemaining = (remainingTime[nextProcess.name] || 0) - executeTime;
        setRemainingTime(prev => ({
          ...prev,
          [nextProcess.name]: newRemaining
        }));
        
        // Check if process completed
        if (newRemaining <= 0) {
          // Process completed
          setExitingProcess(nextProcess.name);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
          if (isMounted) {
            setCompletedProcesses(prev => [...prev, nextProcess]);
          }
        } else {
          // Process not completed, add back to ready queue
          setExitingProcess(nextProcess.name);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
          if (isMounted) {
            setReadyQueue(prev => [...prev, {
              ...nextProcess,
              remainingTime: newRemaining
            }]);
          }
        }
        
        if (isMounted) {
          setCurrentProcess(null);
          setExitingProcess(null);
        }
      } else if (isMounted && readyQueue.length === 0 && pendingProcesses.length > 0) {
        // CPU idle but processes still pending - jump to next arrival
        const nextArrivalTime = Math.min(...pendingProcesses.map(p => p.arrivalTime));
        
        setAnimatingTimeJump(true);
        setTimeJumpTarget(nextArrivalTime);
        
        for (let t = currentTime + 1; t <= nextArrivalTime; t++) {
          if (!isMounted || !isSimulating || isPaused) break;
          setCurrentTime(t);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(100)));
        }
        
        if (!isMounted) return;
        
        setAnimatingTimeJump(false);
        
        // Add idle time to Gantt chart
        if (nextArrivalTime > currentTime) {
          setGanttChart(prev => [
            ...prev,
            {
              name: "Idle",
              startTime: currentTime,
              endTime: nextArrivalTime,
              isIdle: true
            }
          ]);
        }
      }
    };

    const timer = setTimeout(simulationStep, getAnimationDelay(500));
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentTime, isSimulating, isPaused, pendingProcesses, readyQueue, currentProcess, remainingTime, getAnimationDelay, timeQuantum]);
  
  // Stop simulation when all processes complete
  useEffect(() => {
    if (isSimulating && pendingProcesses.length === 0 && readyQueue.length === 0 && !currentProcess) {
      setIsSimulating(false);
    }
  }, [pendingProcesses, readyQueue, currentProcess, isSimulating]);

  // Calculate process statistics
  const calculateProcessStats = useCallback(() => {
    const stats: Record<string, ProcessStats> = {};
    
    // Initialize stats for each process
    processes.forEach(p => {
      stats[p.name] = {
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        responseTime: -1 // -1 means not responded yet
      };
    });
    
    // Find first and last execution for each process
    ganttChart.forEach(entry => {
      if (entry.isIdle || !stats[entry.name]) return;
      
      // Set completion time to the last execution end time
      stats[entry.name].completionTime = entry.endTime;
      
      // Set response time to first execution start time - arrival time
      if (stats[entry.name].responseTime === -1) {
        stats[entry.name].responseTime = entry.startTime - stats[entry.name].arrivalTime;
      }
    });
    
    // Calculate turnaround and waiting times
    Object.keys(stats).forEach(name => {
      if (stats[name].completionTime > 0) {
        stats[name].turnaroundTime = stats[name].completionTime - stats[name].arrivalTime;
        stats[name].waitingTime = stats[name].turnaroundTime - stats[name].burstTime;
      }
    });
    
    return stats;
  }, [ganttChart, processes]);

  const processStats = ganttChart.length > 0 ? calculateProcessStats() : {};

  return (
    <div className="mt-10 mb-10 flex flex-col items-center p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 shadow-2xl text-white min-w-[80vw] mx-auto">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Round Robin Scheduling Visualization
      </h2>

      <div className="w-full flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={startSimulation}
            disabled={isSimulating && !isPaused}
            className={`px-6 py-3 rounded-xl border-2 font-bold transition-all duration-300 shadow-lg transform hover:scale-105 ${
              isSimulating && !isPaused
                ? "bg-gray-800 text-gray-400 border-gray-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-green-600 to-emerald-500 text-white border-green-500 hover:shadow-green-500/30"
            }`}
          >
            {isSimulating && !isPaused ? "Simulation Running..." : 
             isPaused ? "Resume Simulation" : "Start Round Robin"}
          </button>
          
          <button
            onClick={stopSimulation}
            disabled={!isSimulating || isPaused}
            className={`px-6 py-3 rounded-xl border-2 font-bold transition-all duration-300 shadow-lg transform hover:scale-105 ${
              !isSimulating || isPaused
                ? "bg-gray-800 text-gray-400 border-gray-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-orange-600 to-red-500 text-white border-orange-500 hover:shadow-orange-500/30"
            }`}
          >
            Stop Simulation
          </button>
          
          <button
            onClick={resetSimulation}
            className="px-6 py-3 rounded-xl border-2 border-red-500 font-bold transition-all duration-300 bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg hover:shadow-red-500/30 transform hover:scale-105"
          >
            Reset
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Time Quantum Control */}
          <div className="flex items-center space-x-2 bg-gray-800/50 p-3 rounded-xl border border-gray-600">
            <span className="text-sm font-medium text-gray-300">Time Quantum:</span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setTimeQuantum(prev => Math.max(1, prev - 1))}
                disabled={isSimulating && !isPaused}
                className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="10"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                disabled={isSimulating && !isPaused}
                className="w-16 px-2 py-1.5 bg-black text-white border border-gray-600 rounded-lg text-center font-bold"
              />
              <button 
                onClick={() => setTimeQuantum(prev => Math.min(10, prev + 1))}
                disabled={isSimulating && !isPaused}
                className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Animation Speed Control */}
          <div className="flex items-center space-x-2 bg-gray-800/50 p-3 rounded-xl border border-gray-600">
            <span className="text-sm font-medium text-gray-300">Speed:</span>
            <div className="flex space-x-1">
              {[0.5, 1, 2, 4].map(speed => (
                <button 
                  key={speed}
                  onClick={() => setAnimationSpeed(speed)} 
                  className={`px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                    animationSpeed === speed 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-400" 
                      : "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800"
                  }`}
                  disabled={isSimulating && !isPaused}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Status */}
      <div className="w-full mb-4 flex justify-center">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl border border-gray-600 shadow-lg">
          <span className="font-semibold mr-2">Status:</span> 
          <span className={`flex items-center ${
            isSimulating && !isPaused ? "text-green-400" : 
            isPaused ? "text-orange-400" : "text-gray-400"
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${
              isSimulating && !isPaused ? "bg-green-400 animate-pulse" : 
              isPaused ? "bg-orange-400" : "bg-gray-400"
            }`}></span>
            {isSimulating && !isPaused ? "Running" : 
             isPaused ? "Paused" : "Stopped"}
          </span>
          {currentProcess && (
            <span className="ml-4 text-blue-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-ping"></span>
              Executing: {currentProcess.name}
            </span>
          )}
        </div>
      </div>

      {/* Current Time Display */}
      <div className="w-full mb-6 flex justify-center">
        <div className="relative">
          <div className="px-6 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl border border-gray-600 shadow-lg">
            <span className="font-semibold">Current Time:</span> 
            <span className={`inline-block min-w-[3ch] text-center text-2xl font-bold mx-2 ${animatingTimeJump ? "animate-pulse text-yellow-400" : "text-blue-300"}`}>
              {currentTime}
            </span>
            {animatingTimeJump && (
              <span className="text-sm text-yellow-400">
                → {timeJumpTarget}
              </span>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Process Visualization */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Processes */}
        <div className="bg-gradient-to-b from-gray-900/80 to-black p-5 rounded-2xl border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
            <h3 className="text-lg font-semibold text-gray-300">
              Pending Processes
            </h3>
            <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium">
              {pendingProcesses.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {pendingProcesses.map((p) => (
              <div
                key={p.name}
                className={`p-4 rounded-xl border text-center w-32 transition-all duration-300 transform hover:-translate-y-1 ${
                  enteringProcess === p.name 
                    ? "scale-110 border-2 border-yellow-500 shadow-lg shadow-yellow-500/30" 
                    : "border-gray-600 hover:border-gray-500 hover:shadow-lg"
                }`}
                style={{
                  background: `linear-gradient(145deg, ${processColors[p.name]}10, transparent)`,
                  borderLeft: `4px solid ${processColors[p.name] || "#3498db"}`
                }}
              >
                <p className="font-bold text-lg mb-2">{p.name}</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <span className="text-gray-400">Arrival:</span>
                    <span className="ml-1 font-bold">{p.arrivalTime}</span>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <span className="text-gray-400">Burst:</span>
                    <span className="ml-1 font-bold">{p.burstTime}</span>
                  </div>
                </div>
              </div>
            ))}
            {pendingProcesses.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 italic">No pending processes</p>
              </div>
            )}
          </div>
        </div>

        {/* Ready Queue */}
        <div className="bg-gradient-to-b from-gray-900/80 to-black p-5 rounded-2xl border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
            <h3 className="text-lg font-semibold text-gray-300">
              Ready Queue
            </h3>
            <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium">
              {readyQueue.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {readyQueue.map((p, index) => (
              <div
                key={`${p.name}-${index}`}
                className={`p-4 rounded-xl border text-center w-32 transition-all duration-300 ${
                  exitingProcess === p.name 
                    ? "opacity-50 scale-95" 
                    : "border-gray-600 hover:border-gray-500 hover:shadow-lg transform hover:-translate-y-1"
                }`}
                style={{
                  background: `linear-gradient(145deg, ${processColors[p.name]}10, transparent)`,
                  borderLeft: `4px solid ${processColors[p.name] || "#3498db"}`
                }}
              >
                <p className="font-bold text-lg mb-2">{p.name}</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <span className="text-gray-400">Remaining:</span>
                    <span className="ml-1 font-bold">{p.remainingTime}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${((p.burstTime - (p.remainingTime || 0)) / p.burstTime) * 100}%`,
                          backgroundColor: processColors[p.name] || "#3498db"
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {Math.round(((p.burstTime - (p.remainingTime || 0)) / p.burstTime) * 100)}% complete
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {readyQueue.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 italic">Ready queue is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* CPU Execution */}
        <div className="bg-gradient-to-b from-gray-900/80 to-black p-5 rounded-2xl border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
            <h3 className="text-lg font-semibold text-gray-300">CPU Execution</h3>
            <span className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm font-medium">
              {currentProcess ? "Active" : "Idle"}
            </span>
          </div>
          <div className="flex justify-center">
            {currentProcess ? (
              <div className="relative p-5 rounded-xl border-2 text-center w-44 overflow-hidden"
                style={{
                  borderColor: processColors[currentProcess.name] || "#3498db",
                  background: `linear-gradient(145deg, ${processColors[currentProcess.name]}20, ${processColors[currentProcess.name]}05)`,
                  boxShadow: `0 0 20px ${processColors[currentProcess.name]}40`
                }}
              >
                {/* CPU activity animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30"
                  style={{
                    animation: "cpuActivity 1.5s infinite linear",
                    backgroundSize: "200% 100%"
                  }}
                ></div>
                
                <div className="relative z-10">
                  <p className="font-bold text-2xl mb-3">{currentProcess.name}</p>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-gray-900/50 rounded-lg p-2">
                      <div className="text-gray-400 text-xs">Remaining</div>
                      <div className="font-bold">{remainingTime[currentProcess.name]}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2">
                      <div className="text-gray-400 text-xs">Quantum</div>
                      <div className="font-bold">{timeQuantum}</div>
                    </div>
                  </div>
                  
                  {/* Quantum progress bar */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400 font-medium">Quantum Progress</div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${quantumProgress}%`,
                          backgroundColor: processColors[currentProcess.name] || "#3498db",
                          boxShadow: `0 0 8px ${processColors[currentProcess.name]}`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs font-bold">
                      {Math.round(quantumProgress)}%
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">💤</div>
                <p className="text-gray-500 italic">CPU is idle</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completed Processes */}
      <div className="w-full bg-gradient-to-b from-gray-900/80 to-black p-5 rounded-2xl border border-gray-700 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-gray-300">
            Completed Processes
          </h3>
          <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm font-medium">
            {completedProcesses.length}/{processes.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {completedProcesses.map((p) => (
            <div
              key={p.name}
              className="p-4 rounded-xl border border-gray-600 text-center w-32 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(145deg, ${processColors[p.name]}15, transparent)`,
                borderLeft: `4px solid ${processColors[p.name] || "#3498db"}`
              }}
            >
              <p className="font-bold text-lg mb-2">{p.name}</p>
              <div className="flex items-center justify-center">
                <span className="text-xs px-3 py-1 bg-green-900/30 text-green-300 rounded-full">
                  ✓ Completed
                </span>
              </div>
            </div>
          ))}
          {completedProcesses.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 italic">No completed processes</p>
            </div>
          )}
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="w-full bg-gradient-to-b from-gray-900/80 to-black p-6 rounded-2xl border border-gray-700 shadow-xl mb-8">
        <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-600 text-gray-300">
          Gantt Chart
        </h3>
        
        {ganttChart.length > 0 ? (
          <div className="relative">
            <div className="flex h-24 mb-16 relative">
              {ganttChart.map((entry, index) => {
                const blockWidth = 80 + (entry.endTime - entry.startTime) * 20;
                
                return (
                  <div key={`${entry.name}-${index}`} className="flex flex-col items-center group">
                    {/* Process block */}
                    <div
                      className={`h-14 flex items-center justify-center text-white font-bold rounded-lg shadow-lg transition-all duration-300 hover:h-16 hover:-translate-y-1 ${
                        entry.isIdle ? "opacity-80" : ""
                      }`}
                      style={{
                        width: `${blockWidth}px`,
                        minWidth: '60px',
                        backgroundColor: entry.isIdle ? "#4A5568" : (processColors[entry.name] || "#3498db"),
                        background: entry.isIdle 
                          ? "linear-gradient(145deg, #4A5568, #2D3748)" 
                          : `linear-gradient(145deg, ${processColors[entry.name] || "#3498db"}, ${processColors[entry.name] || "#3498db"}AA)`
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold drop-shadow-md">
                          {entry.isIdle ? "Idle" : entry.name}
                        </span>
                        <span className="text-xs opacity-90">
                          {entry.endTime - entry.startTime}u
                        </span>
                      </div>
                    </div>
                    
                    {/* Connecting line */}
                    <div className="w-px h-4 bg-gray-600"></div>
                    
                    {/* Time label */}
                    <div className="mt-1">
                      <div className="text-xs font-medium text-gray-400">
                        {entry.startTime}
                      </div>
                    </div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute top-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm shadow-xl z-10">
                      <div className="font-bold">{entry.isIdle ? "Idle Time" : entry.name}</div>
                      <div>Start: {entry.startTime}</div>
                      <div>End: {entry.endTime}</div>
                      <div>Duration: {entry.endTime - entry.startTime}</div>
                      {!entry.isIdle && entry.quantum && (
                        <div>Quantum used: {entry.quantum}</div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* End time for last entry */}
              {ganttChart.length > 0 && (
                <div className="absolute right-0 bottom-0 transform translate-y-8">
                  <div className="text-xs font-medium text-gray-400">
                    {ganttChart[ganttChart.length - 1].endTime}
                  </div>
                </div>
              )}
            </div>
            
            {/* Timeline base */}
            <div className="absolute left-0 right-0 bottom-8 h-px bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600"></div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500 italic">Gantt chart will appear here after simulation starts</p>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      {Object.keys(processStats).length > 0 && (
        <div className="w-full bg-gradient-to-b from-gray-900/80 to-black p-6 rounded-2xl border border-gray-700 shadow-xl">
          <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-600 text-gray-300">
            Performance Metrics
          </h3>
          
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="min-w-full bg-gray-900/50">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900">
                  <th className="py-3 px-4 border-r border-gray-700 text-left font-semibold">Process</th>
                  <th className="py-3 px-4 border-r border-gray-700 text-center font-semibold">Arrival</th>
                  <th className="py-3 px-4 border-r border-gray-700 text-center font-semibold">Burst</th>
                  <th className="py-3 px-4 border-r border-gray-700 text-center font-semibold">Completion</th>
                  <th className="py-3 px-4 border-r border-gray-700 text-center font-semibold">Turnaround</th>
                  <th className="py-3 px-4 border-r border-gray-700 text-center font-semibold">Waiting</th>
                  <th className="py-3 px-4 text-center font-semibold">Response</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(processStats).map(([name, stats]) => (
                  <tr key={name} className="hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-3 px-4 border-r border-gray-700 font-bold" style={{color: processColors[name] || "#3498db"}}>{name}</td>
                    <td className="py-3 px-4 border-r border-gray-700 text-center">{stats.arrivalTime}</td>
                    <td className="py-3 px-4 border-r border-gray-700 text-center">{stats.burstTime}</td>
                    <td className="py-3 px-4 border-r border-gray-700 text-center">{stats.completionTime}</td>
                    <td className="py-3 px-4 border-r border-gray-700 text-center">{stats.turnaroundTime}</td>
                    <td className="py-3 px-4 border-r border-gray-700 text-center">{stats.waitingTime}</td>
                    <td className="py-3 px-4 text-center">{stats.responseTime}</td>
                  </tr>
                ))}
                
                {/* Average metrics row */}
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900 font-bold">
                  <td className="py-3 px-4 border-r border-gray-700 text-right" colSpan={4}>Average</td>
                  <td className="py-3 px-4 border-r border-gray-700 text-center text-blue-300">
                    {(Object.values(processStats).reduce((sum, stats) => sum + stats.turnaroundTime, 0) / Object.keys(processStats).length).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 border-r border-gray-700 text-center text-orange-300">
                    {(Object.values(processStats).reduce((sum, stats) => sum + stats.waitingTime, 0) / Object.keys(processStats).length).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center text-green-300">
                    {(Object.values(processStats).reduce((sum, stats) => sum + stats.responseTime, 0) / Object.keys(processStats).length).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600">
            <h4 className="font-bold text-lg mb-3 text-gray-300">Round Robin Characteristics:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <span className="text-sm">Each process gets a fixed time slice (quantum) to execute</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <span className="text-sm">Preemptive - Processes can be interrupted when quantum expires</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <span className="text-sm">Fair scheduling - No process gets starved</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <span className="text-sm">Performance depends heavily on quantum size</span>
              </div>
              <div className="flex items-start space-x-2 md:col-span-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <span className="text-sm">Good for time-sharing systems</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CPU Activity Animation CSS */}
      <style>{`
        @keyframes cpuActivity {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default RoundRobin;