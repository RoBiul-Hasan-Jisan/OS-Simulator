import { useState, useEffect } from "react";
import { Process as SchedulerProcess } from "./Scheduler";

// Define interfaces for type safety
interface ExtendedProcess extends Omit<SchedulerProcess, 'burstTime' | 'arrivalTime' | 'priority'> {
  burstTime: string;
  arrivalTime: string;
  priority: string;
  remainingTime: number;
  originalBurstTime: number;
  id: string;
}

interface GanttItem {
  name: string;
  startTime: number;
  endTime: number | null;
  completed: boolean;
  arrivalTime: string;
  burstTime: string;
  remainingBefore?: number;
  remainingAfter?: number;
}

interface ProcessMetrics {
  [key: string]: {
    arrivalTime: number;
    burstTime: number;
    completionTime: number;
    turnaroundTime: number;
    waitingTime: number;
    responseTime: number;
  };
}

interface SRJFProps {
  processes: SchedulerProcess[];
}

// Define colors as a Record type for better type safety
const processColors: Record<string, string> = {
  P1: "#FF5733",
  P2: "#33FF57",
  P3: "#3357FF",
  P4: "#FF33A8",
  P5: "#33FFF9",
};

const SRJF = ({ processes }: SRJFProps) => {
  const [pendingProcesses, setPendingProcesses] = useState<ExtendedProcess[]>([]);
  const [activeProcesses, setActiveProcesses] = useState<ExtendedProcess[]>([]);
  const [completedProcesses, setCompletedProcesses] = useState<ExtendedProcess[]>([]);
  const [currentProcess, setCurrentProcess] = useState<ExtendedProcess | null>(null);
  const [comparingProcess, setComparingProcess] = useState<ExtendedProcess | null>(null);
  const [ganttChart, setGanttChart] = useState<GanttItem[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [animatingTimeJump, setAnimatingTimeJump] = useState<boolean>(false);
  const [timeJumpTarget, setTimeJumpTarget] = useState<number>(0);
  const [preemption, setPreemption] = useState<string | null>(null);

  // Initialize simulation
  const startSimulation = () => {
    console.log("Starting simulation...");

    // Create a deep copy of processes with remaining time
    const processesWithRemaining: ExtendedProcess[] = processes.map((p, index) => {
      const newProcess: ExtendedProcess = {
        ...p,
        arrivalTime: p.arrivalTime.toString(),
        burstTime: p.burstTime.toString(),
        priority: p.priority.toString(),
        remainingTime: p.burstTime,
        originalBurstTime: p.burstTime,
        id: `${p.name}-${index}` // Add a unique ID to each process
      };
      console.log(`Process ${index}:`, newProcess);
      return newProcess;
    });

    console.log("Initial pending processes:", processesWithRemaining);

    setPendingProcesses(processesWithRemaining);
    setActiveProcesses([]);
    setCompletedProcesses([]);
    setGanttChart([]);
    setCurrentProcess(null);
    setComparingProcess(null);
    setCurrentTime(0);
    setPreemption(null);
    setAnimatingTimeJump(false);
    setTimeJumpTarget(0);
    setIsSimulating(true);

    console.log("State variables reset.");
    console.log("Simulation started.");
  };

  // Calculate delay based on animation speed
  const getAnimationDelay = (baseDelay: number): number => {
    if (animationSpeed === 0) {
      console.warn("Warning: animationSpeed is 0, preventing division by zero.");
      return Infinity; // Handle division by zero gracefully
    }

    const calculatedDelay = baseDelay / animationSpeed;
    return calculatedDelay;
  };

  // Main simulation logic
  useEffect(() => {
    if (!isSimulating) return;

    console.log(`--- Simulation Step at time ${currentTime} ---`);
    console.log("Pending Processes:", pendingProcesses);
    console.log("Active Processes:", activeProcesses);

    // Simulation termination condition
    if (pendingProcesses.length === 0 && activeProcesses.length === 0) {
      console.log("No pending or active processes left. Stopping simulation.");
      setIsSimulating(false);
      return;
    }

    const simulationStep = async () => {
      console.log(`Checking newly arrived processes at time ${currentTime}...`);

      // Step 1: Move arrived processes from pending to active
      const newlyArrived = pendingProcesses.filter(p => parseInt(p.arrivalTime) <= currentTime);
      
      if (newlyArrived.length > 0) {
        console.log("Newly arrived processes:", newlyArrived);
        // Fix: Make sure we're not adding duplicate processes
        setPendingProcesses(prev => prev.filter(p => parseInt(p.arrivalTime) > currentTime));
        
        // Add only processes that don't already exist in active processes
        const existingIds = activeProcesses.map(p => p.id);
        const uniqueNewProcesses = newlyArrived.filter(p => !existingIds.includes(p.id));
        
        if (uniqueNewProcesses.length > 0) {
          setActiveProcesses(prev => [...prev, ...uniqueNewProcesses]);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
        }
      }

      // Step 2: Handle time jumps if no active process
      if (activeProcesses.length === 0 && pendingProcesses.length > 0) {
        const nextArrivalTime = Math.min(...pendingProcesses.map(p => parseInt(p.arrivalTime)));
        console.log(`No active processes. Jumping to time ${nextArrivalTime}`);

        setAnimatingTimeJump(true);
        setTimeJumpTarget(nextArrivalTime);

        // Update time step by step
        const timeIncrement = async () => {
          for (let t = currentTime + 1; t <= nextArrivalTime; t++) {
            console.log(`Time increment: ${t}`);
            setCurrentTime(t);
            await new Promise(resolve => setTimeout(resolve, getAnimationDelay(100)));
          }
          setAnimatingTimeJump(false);
        };

        await timeIncrement();
        return;
      }

      // Step 3: Select process with shortest remaining time
      console.log("Active processes:", activeProcesses);
      let shortestProcess: ExtendedProcess | null = null;
      let shortestTime = Infinity;

      console.log("Selecting shortest remaining time process...");
      for (const process of activeProcesses) {
        console.log(`Comparing process ${process.name} with remaining time ${process.remainingTime}`);
        setComparingProcess(process);
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));

        if (process.remainingTime < shortestTime) {
          shortestProcess = process;
          shortestTime = process.remainingTime;
          setCurrentProcess(shortestProcess);
          console.log(`Selected process: ${shortestProcess.name}`);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(200)));
        }
      }

      setComparingProcess(null);

      // Step 4: Check for preemption
      const lastGanttItem = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1] : null;
      const isPreemption = lastGanttItem &&
        shortestProcess &&
        lastGanttItem.name !== shortestProcess.name &&
        !lastGanttItem.completed;

      if (isPreemption && shortestProcess) {
        console.log(`Preempting process ${lastGanttItem.name} for ${shortestProcess.name}`);
        setPreemption(lastGanttItem.name);
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(500)));
        setPreemption(null);

        setGanttChart(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            endTime: currentTime,
            completed: false
          };
          return updated;
        });
      }

      // Step 5: Create new Gantt chart entry
      if (shortestProcess) {
        if(ganttChart.length>0 && ganttChart[ganttChart.length-1].name === shortestProcess.name){
          console.log("Process already in Gantt chart");
        }
        else{
          const newGanttItem: GanttItem = {
            name: shortestProcess.name,
            startTime: currentTime,
            endTime: null,
            completed: false,
            arrivalTime: shortestProcess.arrivalTime,
            burstTime: shortestProcess.originalBurstTime.toString(),
            remainingBefore: shortestProcess.remainingTime
          };
          setGanttChart(prev => [...prev, newGanttItem]);
          console.log(`Adding ${shortestProcess.name} to Gantt chart.`);
        }
      }

      // Step 6: Execute process until completion or preemption
      if (shortestProcess) {
        let shouldContinue = true;
        let nextTime = currentTime;
        
        while (shouldContinue) {
          shouldContinue = false;
          nextTime++;
          console.log(`Executing process ${shortestProcess.name} at time ${nextTime}`);
          setCurrentTime(nextTime);
          setAnimatingTimeJump(true);
          setTimeJumpTarget(nextTime);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
          setAnimatingTimeJump(false);

          // Update remaining time for current process
          const updatedActiveProcesses = activeProcesses.map(p =>
            p.id === shortestProcess.id
              ? { ...p, remainingTime: p.remainingTime - 1 }
              : p
          );

          // Get the updated process
          // Fix: Use id to find the process instead of name
          const updatedProcess = updatedActiveProcesses.find(p => p.id === shortestProcess.id);

          if (!updatedProcess) {
            console.error(`Process ${shortestProcess.name} not found in active processes`);
            shouldContinue = false;
            break;
          }

          // Check if process is complete
          if (updatedProcess.remainingTime === 0) {
            console.log(`Process ${updatedProcess.name} completed at time ${nextTime}`);
            setCompletedProcesses(prev => [...prev, { ...updatedProcess, remainingTime: 0 }]);
            // Fix: Use id to filter out the completed process
            setActiveProcesses(updatedActiveProcesses.filter(p => p.id !== updatedProcess.id));

            setGanttChart(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (lastIndex >= 0) {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  endTime: nextTime,
                  completed: true,
                  remainingAfter: 0
                };
              }
              return updated;
            });

            shouldContinue = false;
            break;
          } else {
            setActiveProcesses(updatedActiveProcesses);
          }

          // Check for new arrivals at this time
          const newArrivals = pendingProcesses.filter(p => parseInt(p.arrivalTime) === nextTime);

          if (newArrivals.length > 0) {
            console.log(`New process arrivals at ${nextTime}:`, newArrivals);
            setPendingProcesses(prev => prev.filter(p => parseInt(p.arrivalTime) > nextTime));
            
            // Add only processes that don't already exist in active processes
            const existingIds = updatedActiveProcesses.map(p => p.id);
            const uniqueNewProcesses = newArrivals.filter(p => !existingIds.includes(p.id));
            
            if (uniqueNewProcesses.length > 0) {
              setActiveProcesses(prev => [...prev, ...uniqueNewProcesses]);
            }

            // Preempt if needed
            const shortestNewArrival = newArrivals.reduce(
              (shortest, current) => parseInt(current.burstTime) < parseInt(shortest.burstTime) ? current : shortest,
              newArrivals[0]
            );

            if (parseInt(shortestNewArrival.burstTime) < updatedProcess.remainingTime) {
              console.log(`Preempting ${updatedProcess.name} for ${shortestNewArrival.name} at time ${nextTime}`);

              setGanttChart(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0) {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    endTime: nextTime,
                    completed: false,
                    remainingAfter: updatedProcess.remainingTime
                  };
                }
                return updated;
              });

              shouldContinue = false;
              break;
            }
          }

          // Check if any other process has shorter remaining time
          // Fix: Need to check all processes except the current one
          const shorterProcess = updatedActiveProcesses.find(p =>
            p.id !== shortestProcess.id && p.remainingTime < updatedProcess.remainingTime
          );

          if (shorterProcess) {
            console.log(`Preempting ${updatedProcess.name} for ${shorterProcess.name} at time ${nextTime}`);

            setGanttChart(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (lastIndex >= 0) {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  endTime: nextTime,
                  completed: false,
                  remainingAfter: updatedProcess.remainingTime
                };
              }
              return updated;
            });

            shouldContinue = false;
            break;
          }
        }

        console.log(`Ending execution cycle at time ${nextTime}`);
        setCurrentProcess(null);
      }
    };

    const timer = setTimeout(simulationStep, getAnimationDelay(500));
    return () => clearTimeout(timer);
  }, [isSimulating, pendingProcesses, activeProcesses, currentTime, animationSpeed]);

  // Calculate process metrics
  const calculateMetrics = (): ProcessMetrics => {
    const metrics: ProcessMetrics = {};

    processes.forEach(proc => {
      const processName = proc.name;
      const arrivalTime = proc.arrivalTime;

      // Find all gantt chart segments for this process
      const segments = ganttChart.filter(item => item.name === processName && item.endTime !== null);

      if (segments.length === 0) return;

      // Find completion time (end time of the last segment)
      const completionTime = Math.max(...segments.map(s => s.endTime as number));

      // Calculate turnaround time
      const turnaroundTime = completionTime - arrivalTime;

      // Calculate waiting time (turnaround time - burst time)
      const burstTime = proc.burstTime;
      const waitingTime = turnaroundTime - burstTime;

      // Calculate response time (start time of first segment - arrival time)
      const responseTime = segments[0].startTime - arrivalTime;

      metrics[processName] = {
        arrivalTime,
        burstTime,
        completionTime,
        turnaroundTime,
        waitingTime,
        responseTime
      };
    });

    return metrics;
  };

  const metrics = ganttChart.length > 0 ? calculateMetrics() : {};

  return (
    <div className="flex flex-col items-center p-6 bg-black rounded-lg border border-white text-white min-w-[80vw] mx-auto">
      <h2 className="text-2xl font-bold mb-6">SRJF Scheduling Visualization</h2>

      <div className="w-full flex justify-between items-center mb-8">
        <button
          onClick={startSimulation}
          disabled={isSimulating}
          className={`px-6 py-3 rounded-lg border border-white font-bold transition-all duration-300 ${
            isSimulating 
              ? "bg-gray-800 text-gray-400 cursor-not-allowed" 
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {isSimulating ? "Simulation in Progress..." : "Start SRJF Simulation"}
        </button>
        
        {/* Animation Speed Control */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">Animation Speed:</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setAnimationSpeed(0.5)} 
              className={`px-3 py-1 rounded border transition-all duration-300 ${
                animationSpeed === 0.5 ? "bg-white text-black" : "bg-black text-white"
              }`}
              disabled={isSimulating && !animatingTimeJump}
            >
              0.5x
            </button>
            <button 
              onClick={() => setAnimationSpeed(1)} 
              className={`px-3 py-1 rounded border transition-all duration-300 ${
                animationSpeed === 1 ? "bg-white text-black" : "bg-black text-white"
              }`}
              disabled={isSimulating && !animatingTimeJump}
            >
              1x
            </button>
            <button 
              onClick={() => setAnimationSpeed(2)} 
              className={`px-3 py-1 rounded border transition-all duration-300 ${
                animationSpeed === 2 ? "bg-white text-black" : "bg-black text-white"
              }`}
              disabled={isSimulating && !animatingTimeJump}
            >
              2x
            </button>
          </div>
        </div>
      </div>

      {/* Current Time Display */}
      <div className="w-full mb-6 text-center">
        <div className="inline-block px-4 py-2 bg-black text-white rounded-lg border border-white overflow-hidden relative">
          <span className="font-semibold">Current Time:</span> 
          <span className={`inline-block min-w-[3ch] text-center ${animatingTimeJump ? "animate-pulse text-yellow-400" : ""}`}>
            {currentTime}
          </span>
          {animatingTimeJump && (
            <span className="text-xs text-yellow-400 ml-2">
              → {timeJumpTarget}
            </span>
          )}
        </div>
      </div>

      {/* Process Queue Visualization */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Pending Processes */}
        <div className="bg-black p-4 rounded-lg border border-white">
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Pending Processes</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {pendingProcesses.map((p) => (
              <div
                key={p.name}
                className="p-3 rounded-lg border border-white text-center w-28"
                style={{
                  borderLeft: `5px solid ${processColors[p.name] || "#3498db"}`
                }}
              >
                <p className="font-bold text-lg">{p.name}</p>
                <div className="grid grid-cols-1 gap-1 mt-2 text-xs">
                  <p className="bg-gray-900 rounded p-1">Arrival: {p.arrivalTime}</p>
                  <p className="bg-gray-900 rounded p-1">Burst: {p.originalBurstTime}</p>
                </div>
              </div>
            ))}
            {pendingProcesses.length === 0 && (
              <p className="text-gray-400 italic">No pending processes</p>
            )}
          </div>
        </div>

        {/* Active Processes */}
        <div className="bg-black p-4 rounded-lg border border-white">
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Active Processes</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {activeProcesses.map((p) => (
              <div
                key={p.name}
                className={`p-3 rounded-lg border text-center w-28 transition-all duration-300 ${
                  currentProcess && currentProcess.name === p.name
                    ? "scale-110 border-yellow-500 border-2 bg-yellow-900 bg-opacity-30"
                    : comparingProcess && comparingProcess.name === p.name
                      ? "scale-105 border-red-500 border-2 bg-red-900 bg-opacity-30"
                      : preemption === p.name
                        ? "scale-95 border-blue-500 border-2 bg-blue-900 bg-opacity-30"
                        : "border-white"
                }`}
                style={{
                  borderLeft: `5px solid ${processColors[p.name] || "#3498db"}`
                }}
              >
                <p className="font-bold text-lg">{p.name}</p>
                <div className="grid grid-cols-1 gap-1 mt-2 text-xs">
                  <p className="bg-gray-900 rounded p-1">Remaining: {p.remainingTime}</p>
                  <div className="bg-gray-900 rounded p-1 mt-1">
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full"
                        style={{
                          width: `${(p.remainingTime / p.originalBurstTime) * 100}%`,
                          backgroundColor: processColors[p.name] || "#3498db"
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {activeProcesses.length === 0 && (
              <p className="text-gray-400 italic">No active processes</p>
            )}
          </div>
        </div>

        {/* Completed Processes */}
        <div className="bg-black p-4 rounded-lg border border-white">
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Completed Processes</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {completedProcesses.map((p) => (
              <div
                key={p.name}
                className="p-3 rounded-lg border border-white text-center w-28"
                style={{ 
                  borderLeftColor: processColors[p.name] || "#3498db",
                  borderLeftWidth: "5px"
                }}
              >
                <p className="font-bold text-lg">{p.name}</p>
                <p className="text-xs mt-1 bg-gray-900 rounded p-1">Completed</p>
              </div>
            ))}
            {completedProcesses.length === 0 && (
              <p className="text-gray-400 italic">No completed processes</p>
            )}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="w-full bg-black p-4 rounded-lg border border-white mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b border-white pb-2">Gantt Chart</h3>
        
        {ganttChart.length > 0 ? (
          <div className="relative">
            {/* Time Axis */}
            <div className="absolute left-0 right-0 bottom-0 h-8 border-t border-white"></div>
            
            {/* Process Blocks */}
            <div className="flex h-20 mb-12 relative">
              {ganttChart.map((p, index) => {
                // Skip if endTime is not set yet
                if (p.endTime === null) return null;
                
                // Calculate total timeline length for scaling
                const totalTime = Math.max(...ganttChart.filter(g => g.endTime !== null).map(g => g.endTime as number));
                
                // Calculate width as percentage of total time
                const blockWidth = ((p.endTime - p.startTime) / totalTime) * 100;
                
                return (
                  <div key={`${p.name}-${p.startTime}`} className="relative h-full">
                    {/* Process block */}
                    <div
                      className={`h-4/5 mt-2 flex items-center justify-center text-white font-bold rounded-md shadow-md transition-all duration-300 hover:h-full hover:mt-0 ${
                        p.completed ? "" : "border-r-4 border-dashed border-white"
                      }`}
                      style={{
                        width: `${blockWidth}%`,
                        backgroundColor: processColors[p.name] || "#3498db",
                        minWidth: '30px'
                      }}
                    >
                      <div className="flex flex-col items-center p-1">
                        <span className="text-sm font-bold">{p.name}</span>
                        <span className="text-xs">{p.endTime - p.startTime}u</span>
                      </div>
                    </div>
                    
                    {/* Vertical timeline connector */}
                    <div className="absolute left-0 -bottom-8 w-px h-8 bg-gray-600"></div>
                    
                    {/* Time label */}
                    <div className="absolute left-0 -bottom-8 text-xs font-medium bg-gray-800 px-1 py-1 rounded-md transform -translate-x-1/2">
                      {p.startTime}
                    </div>
                    
                    {index === ganttChart.length - 1 && (
                      <div className="absolute right-0 -bottom-8 text-xs font-medium bg-gray-800 px-1 py-1 rounded-md transform translate-x-1/2">
                        {p.endTime}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Timeline base */}
              <div className="absolute left-0 right-0 -bottom-8 h-px bg-gray-500"></div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 italic text-center py-8">Gantt chart will appear here after simulation starts</p>
        )}
      </div>

      {/* Metrics Table (when simulation completes) */}
      {Object.keys(metrics).length > 0 && completedProcesses.length === processes.length && (
        <div className="w-full bg-black p-4 rounded-lg border border-white">
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Performance Metrics</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-black">
              <thead>
                <tr className="bg-gray-900">
                  <th className="py-2 px-4 border border-white">Process</th>
                  <th className="py-2 px-4 border border-white">Arrival Time</th>
                  <th className="py-2 px-4 border border-white">Burst Time</th>
                  <th className="py-2 px-4 border border-white">Completion Time</th>
                  <th className="py-2 px-4 border border-white">Turnaround Time</th>
                  <th className="py-2 px-4 border border-white">Waiting Time</th>
                  <th className="py-2 px-4 border border-white">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics).map(([processName, data]) => (
                  <tr key={processName}>
                    <td className="py-2 px-4 border border-white font-medium" style={{color: processColors[processName] || "#3498db"}}>{processName}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.arrivalTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.burstTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.completionTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.turnaroundTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.waitingTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.responseTime}</td>
                  </tr>
                ))}
                
                {/* Average metrics row */}
                {Object.keys(metrics).length > 0 && (
                  <tr className="bg-gray-900 font-semibold">
                    <td className="py-2 px-4 border border-white text-right" >Average</td>
                    <td className="py-2 px-4 border border-white text-center">
                      {(Object.values(metrics).reduce((sum, data) => sum + data.turnaroundTime, 0) / Object.keys(metrics).length).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border border-white text-center">
                      {(Object.values(metrics).reduce((sum, data) => sum + data.waitingTime, 0) / Object.keys(metrics).length).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border border-white text-center">
                      {(Object.values(metrics).reduce((sum, data) => sum + data.responseTime, 0) / Object.keys(metrics).length).toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SRJF;