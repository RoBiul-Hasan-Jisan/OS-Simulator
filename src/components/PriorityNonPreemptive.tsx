import { useState, useEffect, useCallback } from "react";

// Define interfaces
interface Process {
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  startTime?: number;
  endTime?: number;
}

interface GanttChartEntry extends Process {
  startTime: number;
  endTime: number;
}

interface SimulationState {
  initialized: boolean;
  executingProcess: Process | null;
  processStartTime: number | null;
  processEndTime: number | null;
  executionProgress: number;
}

interface PriorityNonPreemptiveProps {
  processes: Array<{
    name: string;
    arrivalTime: string | number;
    burstTime: string | number;
    priority: string | number;
  }>;
}

// Define process colors
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

// Helper function to safely parse numeric values
const parseNumber = (value: string | number): number => {
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return value;
};

const PriorityNonPreemptive = ({ processes }: PriorityNonPreemptiveProps) => {
  const [pendingProcesses, setPendingProcesses] = useState<Process[]>([]);
  const [completedProcesses, setCompletedProcesses] = useState<Process[]>([]);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
  const [ganttChart, setGanttChart] = useState<GanttChartEntry[]>([]);
  const [comparingProcess, setComparingProcess] = useState<Process | null>(null);
  const [fadeOutProcess, setFadeOutProcess] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animatingTimeJump, setAnimatingTimeJump] = useState<boolean>(false);
  const [, setTimeJumpTarget] = useState<number>(0);
  const [simulationState, setSimulationState] = useState<SimulationState>({
    initialized: false,
    executingProcess: null,
    processStartTime: null,
    processEndTime: null,
    executionProgress: 0
  });
  const [simulationStats, setSimulationStats] = useState({
    totalIdleTime: 0,
    cpuUtilization: 0,
    throughput: 0
  });

  // Convert input processes to internal format
  const convertProcesses = useCallback((procs: PriorityNonPreemptiveProps['processes']): Process[] => {
    return procs.map(p => ({
      name: p.name, // Make sure to include the name property
      arrivalTime: parseNumber(p.arrivalTime),
      burstTime: parseNumber(p.burstTime),
      priority: parseNumber(p.priority)
    }));
  }, []);

  const startSimulation = (): void => {
    const convertedProcesses = convertProcesses(processes);
    setPendingProcesses([...convertedProcesses]);
    setCompletedProcesses([]);
    setGanttChart([]);
    setCurrentProcess(null);
    setComparingProcess(null);
    setFadeOutProcess(null);
    setCurrentTime(0);
    setAnimatingTimeJump(false);
    setTimeJumpTarget(0);
    setSimulationStats({
      totalIdleTime: 0,
      cpuUtilization: 0,
      throughput: 0
    });
    setSimulationState({
      initialized: true,
      executingProcess: null,
      processStartTime: null,
      processEndTime: null,
      executionProgress: 0
    });
    setIsSimulating(true);
    setIsPaused(false);
  };

  const stopSimulation = (): void => {
    setIsSimulating(false);
    setIsPaused(true);
  };

  const resetSimulation = (): void => {
    setPendingProcesses([]);
    setCompletedProcesses([]);
    setGanttChart([]);
    setCurrentProcess(null);
    setComparingProcess(null);
    setFadeOutProcess(null);
    setCurrentTime(0);
    setAnimatingTimeJump(false);
    setTimeJumpTarget(0);
    setIsSimulating(false);
    setIsPaused(false);
    setSimulationStats({
      totalIdleTime: 0,
      cpuUtilization: 0,
      throughput: 0
    });
    setSimulationState({
      initialized: false,
      executingProcess: null,
      processStartTime: null,
      processEndTime: null,
      executionProgress: 0
    });
  };

  const pauseSimulation = (): void => {
    if (isSimulating) {
      setIsPaused(true);
    }
  };


  const addNewProcesses = (newProcesses: Process[]): void => {
    const filteredNewProcesses = newProcesses.filter(newProcess => 
      newProcess.arrivalTime >= currentTime &&
      !pendingProcesses.some(p => p.name === newProcess.name) &&
      !completedProcesses.some(p => p.name === newProcess.name)
    );

    if (filteredNewProcesses.length > 0) {
      setPendingProcesses(prev => [...prev, ...filteredNewProcesses]);
    }
  };

  useEffect(() => {
    if (simulationState.initialized && processes.length > 0) {
      addNewProcesses(convertProcesses(processes));
    }
  }, [processes, simulationState.initialized, convertProcesses]);

  const getAnimationDelay = (baseDelay: number): number => {
    return baseDelay / animationSpeed;
  };

  // Main simulation logic
  useEffect(() => {
    if (!isSimulating || isPaused) return;

    let animationFrameId: number;
    let lastUpdateTime = Date.now();

    const simulationStep = async () => {
      if (!isSimulating || isPaused) return;

      const now = Date.now();
      const elapsed = now - lastUpdateTime;
      
      if (elapsed < getAnimationDelay(100)) {
        animationFrameId = requestAnimationFrame(simulationStep);
        return;
      }

      lastUpdateTime = now;

      // If currently executing a process
      if (simulationState.executingProcess && simulationState.processEndTime) {
        const process = simulationState.executingProcess;
        
        if (currentTime < simulationState.processEndTime) {
          setCurrentTime(prev => prev + 1);
          
          // Calculate progress percentage
          const progress = ((currentTime + 1 - (simulationState.processStartTime || 0)) / 
                          (simulationState.processEndTime - (simulationState.processStartTime || 0))) * 100;
          
          setSimulationState(prev => ({
            ...prev,
            executionProgress: Math.min(100, progress)
          }));
        } else {
          // Process execution completed
          setGanttChart(prev => [...prev, {
            ...process,
            startTime: simulationState.processStartTime || 0,
            endTime: simulationState.processEndTime || 0
          }]);
          
          setCompletedProcesses(prev => [...prev, process]);
          setPendingProcesses(prev => prev.filter(p => p.name !== process.name));
          setCurrentProcess(null);
          setFadeOutProcess(null);
          
          setSimulationState({
            initialized: true,
            executingProcess: null,
            processStartTime: null,
            processEndTime: null,
            executionProgress: 0
          });
        }
        
        animationFrameId = requestAnimationFrame(simulationStep);
        return;
      }

      // No process executing, find next process
      const arrivedProcesses = pendingProcesses.filter(p => p.arrivalTime <= currentTime);
      
      if (arrivedProcesses.length === 0) {
        // No processes arrived yet, increment time
        setCurrentTime(prev => prev + 1);
        setSimulationStats(prev => ({
          ...prev,
          totalIdleTime: prev.totalIdleTime + 1
        }));
        animationFrameId = requestAnimationFrame(simulationStep);
        return;
      }

      // Find process with highest priority (lowest number)
      const selectedProcess = arrivedProcesses.reduce((highest, current) => {
        return current.priority < highest.priority ? current : highest;
      });

      setCurrentProcess(selectedProcess);
      setComparingProcess(null);

      // Calculate start and end times
      const startTime = Math.max(currentTime, selectedProcess.arrivalTime);
      const endTime = startTime + selectedProcess.burstTime;

      // If start time is in the future, advance time
      if (startTime > currentTime) {
        const idleTime = startTime - currentTime;
        setCurrentTime(startTime);
        setSimulationStats(prev => ({
          ...prev,
          totalIdleTime: prev.totalIdleTime + idleTime
        }));
        animationFrameId = requestAnimationFrame(simulationStep);
        return;
      }

      // Start executing the process
      setSimulationState({
        initialized: true,
        executingProcess: selectedProcess,
        processStartTime: startTime,
        processEndTime: endTime,
        executionProgress: 0
      });

      setFadeOutProcess(selectedProcess.name);
      animationFrameId = requestAnimationFrame(simulationStep);
    };

    simulationStep();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isSimulating, isPaused, pendingProcesses, currentTime, simulationState, animationSpeed]);

  // Update statistics when simulation completes
  useEffect(() => {
    if (!isSimulating && ganttChart.length > 0 && completedProcesses.length > 0) {
      const totalTime = Math.max(...ganttChart.map(p => p.endTime));
      const totalExecutionTime = ganttChart.reduce((sum, p) => sum + (p.endTime - p.startTime), 0);
      const cpuUtilization = (totalExecutionTime / totalTime) * 100;
      const throughput = completedProcesses.length / totalTime;

      setSimulationStats({
        totalIdleTime: totalTime - totalExecutionTime,
        cpuUtilization,
        throughput
      });
    }
  }, [isSimulating, ganttChart, completedProcesses]);

  // Calculate metrics for display
  const calculateMetrics = (process: GanttChartEntry) => {
    const turnaroundTime = process.endTime - process.arrivalTime;
    const waitingTime = process.startTime - process.arrivalTime;
    const responseTime = waitingTime; // Same as waiting time for non-preemptive
    
    return {
      turnaroundTime,
      waitingTime,
      responseTime
    };
  };

  return (
    <div className="mt-10 mb-10 flex flex-col items-center p-6 bg-gray-900 rounded-xl border border-gray-700 text-white min-w-[80vw] mx-auto shadow-2xl">
      <div className="w-full max-w1-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Priority Non-Preemptive Scheduling
          </h2>
          <p className="text-gray-300">Lower priority value means higher priority</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Higher Priority</span>
            <div className="w-3 h-3 rounded-full bg-red-500 ml-4"></div>
            <span className="text-sm">Lower Priority</span>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={startSimulation}
                disabled={isSimulating && !isPaused}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                  isSimulating && !isPaused
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                }`}
              >
                {isSimulating && !isPaused ? "▶ Running..." : 
                 isPaused ? "▶ Resume" : "▶ Start Simulation"}
              </button>
              
              <button
                onClick={pauseSimulation}
                disabled={!isSimulating || isPaused}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                  !isSimulating || isPaused
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700"
                }`}
              >
                ⏸ Pause
              </button>
              
              <button
                onClick={stopSimulation}
                disabled={!isSimulating}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                  !isSimulating
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
                }`}
              >
                ⏹ Stop
              </button>
              
              <button
                onClick={resetSimulation}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold transition-all duration-300 transform hover:scale-105 hover:from-gray-700 hover:to-gray-800 border border-gray-600"
              >
                ↻ Reset
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">Speed:</span>
                <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
                  {[0.5, 1, 2, 4].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setAnimationSpeed(speed)}
                      className={`px-3 py-1 rounded transition-all duration-300 ${
                        animationSpeed === speed
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      }`}
                      disabled={isSimulating && !isPaused}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-gray-700 rounded-lg border border-gray-600">
                  <span className="font-semibold">Time: </span>
                  <span className={`font-mono ${animatingTimeJump ? "animate-pulse text-yellow-400" : "text-blue-300"}`}>
                    {currentTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isSimulating && !isPaused 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : isPaused
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-gray-700 text-gray-400"
                }`}>
                  {isSimulating && !isPaused ? "● Running" : 
                   isPaused ? "⏸ Paused" : "◼ Stopped"}
                </div>
                
                {simulationState.executingProcess && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-blue-300">
                      Executing: <span className="font-bold">{simulationState.executingProcess.name}</span>
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-gray-400">Pending: </span>
                  <span className="font-bold text-yellow-300">{pendingProcesses.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Completed: </span>
                  <span className="font-bold text-green-300">{completedProcesses.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total: </span>
                  <span className="font-bold">{processes.length}</span>
                </div>
              </div>
            </div>
            
            {/* Progress bar for current process */}
            {simulationState.executingProcess && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{simulationState.executingProcess.name} Progress</span>
                  <span>{simulationState.executionProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${simulationState.executionProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pending Processes */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                Pending Processes
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-full">
                  {pendingProcesses.length}
                </span>
              </h3>
              <div className="text-sm text-gray-400">
                Arrival Time ≤ {currentTime}
              </div>
            </div>
            
            {pendingProcesses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>No pending processes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingProcesses.map((p) => (
                  <div
                    key={p.name}
                    className={`bg-gray-700/50 rounded-lg p-4 border-2 transition-all duration-300 ${
                      fadeOutProcess === p.name
                        ? "opacity-0 scale-95 translate-y-2"
                        : currentProcess?.name === p.name
                        ? "border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20"
                        : comparingProcess?.name === p.name
                        ? "border-red-500 bg-red-500/10"
                        : "border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: processColors[p.name] || "#3498db" }}
                        ></div>
                        <span className="font-bold text-lg">{p.name}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        p.priority <= 3 ? "bg-green-500/20 text-green-400" :
                        p.priority <= 6 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        Priority: {p.priority}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-900/50 rounded p-2">
                        <div className="text-gray-400 text-xs">Arrival</div>
                        <div className="font-mono">{p.arrivalTime}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2">
                        <div className="text-gray-400 text-xs">Burst</div>
                        <div className="font-mono">{p.burstTime}</div>
                      </div>
                    </div>
                    
                    {currentProcess?.name === p.name && (
                      <div className="mt-3 text-xs text-yellow-400 animate-pulse">
                        ⭐ Currently selected (highest priority)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Processes */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Completed Processes
                <span className="ml-2 px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">
                  {completedProcesses.length}
                </span>
              </h3>
            </div>
            
            {completedProcesses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No completed processes yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedProcesses.map((p) => {
                  const ganttEntry = ganttChart.find(g => g.name === p.name);
                  if (!ganttEntry) return null;
                  
                  const metrics = calculateMetrics(ganttEntry);
                  
                  return (
                    <div
                      key={p.name}
                      className="bg-gray-700/30 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: processColors[p.name] || "#3498db" }}
                          ></div>
                          <span className="font-bold">{p.name}</span>
                        </div>
                        <span className="text-xs text-green-400">✓ Completed</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-gray-900/50 rounded p-2">
                          <div className="text-gray-400">TAT</div>
                          <div className="font-bold">{metrics.turnaroundTime}</div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-2">
                          <div className="text-gray-400">Wait</div>
                          <div className="font-bold">{metrics.waitingTime}</div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-2">
                          <div className="text-gray-400">Resp</div>
                          <div className="font-bold">{metrics.responseTime}</div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-400">
                        Completed at: <span className="font-mono">{ganttEntry.endTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Gantt Chart
            </h3>
            <div className="text-sm text-gray-400">
              Timeline Visualization
            </div>
          </div>
          
          {ganttChart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">📈</div>
              <p className="text-lg">Gantt chart will appear here</p>
              <p className="text-sm mt-2">Start the simulation to see the scheduling timeline</p>
            </div>
          ) : (
            <div className="relative">
              {/* Time scale */}
              <div className="flex mb-2 ml-12">
                {Array.from({ length: Math.max(...ganttChart.map(p => p.endTime)) + 1 }).map((_, i) => (
                  <div key={i} className="flex-1 text-center text-xs text-gray-400">
                    {i % 5 === 0 && i}
                  </div>
                ))}
              </div>
              
              {/* Chart container */}
              <div className="relative h-24 bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: Math.max(...ganttChart.map(p => p.endTime)) + 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-l border-gray-700/50"
                      style={{ borderLeftStyle: i % 5 === 0 ? 'solid' : 'dashed' }}
                    ></div>
                  ))}
                </div>
                
                {/* Process bars */}
                {ganttChart.map((p, index) => {
                  const prevEndTime = index > 0 ? ganttChart[index - 1].endTime : 0;
                  const idleTime = p.startTime - prevEndTime;
                  const totalWidth = Math.max(...ganttChart.map(g => g.endTime));
                  const processWidth = ((p.endTime - p.startTime) / totalWidth) * 100;
                  const idleWidth = (idleTime / totalWidth) * 100;
                  
                  return (
                    <div key={p.name} className="absolute h-full flex">
                      {/* Idle time */}
                      {idleTime > 0 && (
                        <div
                          className="h-full bg-gray-800/30 border-r border-gray-700"
                          style={{ width: `${idleWidth}%` }}
                        >
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 text-xs text-gray-500">
                            Idle: {idleTime}
                          </div>
                        </div>
                      )}
                      
                      {/* Process bar */}
                      <div
                        className="h-4/5 my-auto rounded-lg shadow-lg transition-all duration-300 hover:h-full hover:shadow-xl hover:z-10 relative group"
                        style={{
                          width: `${processWidth}%`,
                          backgroundColor: processColors[p.name] || "#3498db",
                          minWidth: '40px',
                          marginLeft: idleTime > 0 ? '0' : 'auto'
                        }}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <span className="font-bold">{p.name}</span>
                          <span className="text-xs opacity-80">{p.endTime - p.startTime}u</span>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 border border-gray-700">
                          <div className="font-bold mb-1">{p.name}</div>
                          <div>Start: {p.startTime}</div>
                          <div>End: {p.endTime}</div>
                          <div>Duration: {p.endTime - p.startTime}</div>
                          <div>Priority: {p.priority}</div>
                        </div>
                        
                        {/* Time markers */}
                        <div className="absolute -bottom-6 left-0 text-xs text-gray-400">
                          {p.startTime}
                        </div>
                        {index === ganttChart.length - 1 && (
                          <div className="absolute -bottom-6 right-0 text-xs text-gray-400">
                            {p.endTime}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        {completedProcesses.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
              Performance Metrics
            </h3>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
                <div className="text-3xl font-bold mb-2">{simulationStats.cpuUtilization.toFixed(1)}%</div>
                <div className="text-sm text-blue-300">CPU Utilization</div>
                <div className="text-xs text-gray-400 mt-2">
                  Total idle time: {simulationStats.totalIdleTime}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
                <div className="text-3xl font-bold mb-2">{simulationStats.throughput.toFixed(2)}</div>
                <div className="text-sm text-green-300">Throughput (processes/unit time)</div>
                <div className="text-xs text-gray-400 mt-2">
                  {completedProcesses.length} processes / {Math.max(...ganttChart.map(p => p.endTime))} time units
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
                <div className="text-3xl font-bold mb-2">
                  {ganttChart.reduce((sum, p) => {
                    const metrics = calculateMetrics(p);
                    return sum + metrics.turnaroundTime;
                  }, 0) / ganttChart.length || 0}
                </div>
                <div className="text-sm text-purple-300">Avg Turnaround Time</div>
                <div className="text-xs text-gray-400 mt-2">
                  Lower is better
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50">
                    <th className="py-3 px-4 text-left">Process</th>
                    <th className="py-3 px-4 text-center">Arrival</th>
                    <th className="py-3 px-4 text-center">Burst</th>
                    <th className="py-3 px-4 text-center">Priority</th>
                    <th className="py-3 px-4 text-center">Start</th>
                    <th className="py-3 px-4 text-center">End</th>
                    <th className="py-3 px-4 text-center">TAT</th>
                    <th className="py-3 px-4 text-center">Wait</th>
                    <th className="py-3 px-4 text-center">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {ganttChart.map((p) => {
                    const metrics = calculateMetrics(p);
                    return (
                      <tr key={p.name} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: processColors[p.name] || "#3498db" }}
                            ></div>
                            <span className="font-medium">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">{p.arrivalTime}</td>
                        <td className="py-3 px-4 text-center">{p.burstTime}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            p.priority <= 3 ? "bg-green-500/20 text-green-400" :
                            p.priority <= 6 ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {p.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{p.startTime}</td>
                        <td className="py-3 px-4 text-center">{p.endTime}</td>
                        <td className="py-3 px-4 text-center font-bold">{metrics.turnaroundTime}</td>
                        <td className="py-3 px-4 text-center">{metrics.waitingTime}</td>
                        <td className="py-3 px-4 text-center">{metrics.responseTime}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-900/50 font-bold">
                    <td className="py-3 px-4" colSpan={6}>Averages</td>
                    <td className="py-3 px-4 text-center text-blue-300">
                      {(ganttChart.reduce((sum, p) => sum + calculateMetrics(p).turnaroundTime, 0) / ganttChart.length).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center text-blue-300">
                      {(ganttChart.reduce((sum, p) => sum + calculateMetrics(p).waitingTime, 0) / ganttChart.length).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center text-blue-300">
                      {(ganttChart.reduce((sum, p) => sum + calculateMetrics(p).responseTime, 0) / ganttChart.length).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Algorithm Explanation */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></span>
            How Priority Non-Preemptive Scheduling Works
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-lg mb-2 text-cyan-300">Key Characteristics</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Each process has a priority number (lower = higher priority)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Process with highest priority runs to completion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>No interruption once execution starts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">⚠</span>
                    <span>Can cause starvation for low-priority processes</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-lg mb-2 text-cyan-300">Advantages</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Simple to implement</li>
                  <li>• Good for real-time systems</li>
                  <li>• Ensures important tasks complete first</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-lg mb-2 text-cyan-300">Disadvantages</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Starvation of low-priority processes</li>
                  <li>• Indefinite blocking possible</li>
                  <li>• Not optimal for time-sharing systems</li>
                </ul>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-lg mb-2 text-cyan-300">Common Solutions</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Aging</strong>: Gradually increase priority of waiting processes</li>
                  <li>• <strong>Priority Inheritance</strong>: Temporary priority boost</li>
                  <li>• <strong>Hybrid approaches</strong>: Combine with round-robin</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-center text-sm text-gray-400">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span>High Priority (1-3)</span>
              </div>
              <div className="flex items-center mx-6">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                <span>Medium Priority (4-6)</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                <span>Low Priority (7+)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Priority Non-Preemptive Scheduling Visualization • Lower priority values indicate higher priority</p>
          <p className="mt-2">Simulation updates in real-time based on selected speed</p>
        </div>
      </div>
    </div>
  );
};

export default PriorityNonPreemptive;