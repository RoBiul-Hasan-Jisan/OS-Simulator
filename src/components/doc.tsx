import { Link } from "react-router-dom";

const Doc = () => {
  const algorithms = [
    {
      name: "First Come First Serve (FCFS)",
      abbreviation: "FCFS",
      description: "The simplest CPU scheduling algorithm that executes processes in the order they arrive.",
      type: "Non-preemptive",
      characteristics: [
        "Processes are executed in the order of arrival",
        "Simple to implement with FIFO queue",
        "No starvation as every process gets executed",
        "Poor performance as average waiting time is often high",
        "Convoy effect may occur"
      ],
      formula: "Waiting Time = Completion Time - Arrival Time - Burst Time",
      example: "If processes arrive in order P1, P2, P3, they execute in that exact order."
    },
    {
      name: "Shortest Job First (SJF)",
      abbreviation: "SJF",
      description: "Executes the process with the smallest burst time first.",
      type: "Non-preemptive",
      characteristics: [
        "Selects process with minimum burst time",
        "Optimal for minimizing average waiting time",
        "May cause starvation for longer processes",
        "Requires knowledge of next CPU burst time",
        "Can't be implemented at OS level"
      ],
      formula: "Choose process with min(burst time)",
      example: "If P1(bt=6), P2(bt=8), P3(bt=7) are ready, P1 executes first."
    },
    {
      name: "Shortest Remaining Time First (SRTF)",
      abbreviation: "SRTF",
      description: "Preemptive version of SJF where the process with shortest remaining time gets CPU.",
      type: "Preemptive",
      characteristics: [
        "Preemptive version of SJF",
        "Process with shortest remaining time executes",
        "Better response time than SJF",
        "More overhead due to frequent context switching",
        "May cause starvation"
      ],
      formula: "Always schedule process with min(remaining burst time)",
      example: "If new process arrives with shorter burst, current process is preempted."
    },
    {
      name: "Round Robin (RR)",
      abbreviation: "RR",
      description: "Each process gets a small unit of CPU time (time quantum) in circular fashion.",
      type: "Preemptive",
      characteristics: [
        "Each process gets fixed time quantum",
        "Fair allocation of CPU time",
        "Good for time-sharing systems",
        "Performance depends on time quantum size",
        "No starvation"
      ],
      formula: "Time Quantum (tq) typically 10-100ms",
      example: "With time quantum=4, each process gets 4ms then moves to back of queue."
    },
    {
      name: "Priority Scheduling",
      abbreviation: "Priority",
      description: "Processes are executed based on priority. Can be preemptive or non-preemptive.",
      type: "Both (Preemptive/Non-preemptive)",
      characteristics: [
        "Process with highest priority executes first",
        "Priority can be internal or external",
        "May cause starvation (aging can solve this)",
        "Preemptive version allows higher priority to preempt",
        "Used in real-time systems"
      ],
      formula: "Choose process with highest priority (lowest number = highest priority usually)",
      example: "P1(priority=1), P2(priority=3), P3(priority=2) → P1 executes first."
    }
  ];

  const performanceMetrics = [
    {
      term: "Arrival Time",
      definition: "Time at which process arrives in ready queue"
    },
    {
      term: "Burst Time",
      definition: "Time required by process for CPU execution"
    },
    {
      term: "Completion Time",
      definition: "Time at which process completes execution"
    },
    {
      term: "Turnaround Time",
      definition: "Completion Time - Arrival Time (Total time in system)"
    },
    {
      term: "Waiting Time",
      definition: "Turnaround Time - Burst Time (Time spent waiting)"
    },
    {
      term: "Response Time",
      definition: "Time from submission to first response"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-3">
                CPU Scheduling Algorithms
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Comprehensive guide to process scheduling algorithms in operating systems
              </p>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              ← Back to Simulator
            </Link>
          </div>
        </header>

        {/* Introduction */}
        <section className="mb-16">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Introduction</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              CPU scheduling is a fundamental function of operating systems. The scheduler selects which 
              process runs on the CPU from among ready processes. Different algorithms optimize for different 
              metrics like throughput, latency, fairness, or responsiveness.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Scheduling Criteria</h3>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>• CPU Utilization</li>
                  <li>• Throughput</li>
                  <li>• Turnaround Time</li>
                  <li>• Waiting Time</li>
                  <li>• Response Time</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">Scheduler Types</h3>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>• Long-term (Job) Scheduler</li>
                  <li>• Short-term (CPU) Scheduler</li>
                  <li>• Medium-term Scheduler</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Key Decisions</h3>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>• Which process runs next?</li>
                  <li>• How long should it run?</li>
                  <li>• When to preempt?</li>
                  <li>• Queue management</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Algorithms */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Algorithms</h2>
          <div className="space-y-8">
            {algorithms.map((algo) => (
              <div key={algo.abbreviation} className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm font-semibold px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        {algo.abbreviation}
                      </span>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        algo.type.includes('Preemptive') 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {algo.type}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {algo.name}
                    </h3>
                  </div>
                </div>

                <p className="text-zinc-700 dark:text-zinc-300 mb-6">{algo.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Characteristics
                    </h4>
                    <ul className="space-y-3">
                      {algo.characteristics.map((char, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                          {char}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Formula
                      </h4>
                      <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                        <code className="font-mono text-sm text-green-600 dark:text-green-400">
                          {algo.formula}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Example
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        {algo.example}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="mb-16">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {performanceMetrics.map((metric, index) => (
                <div key={metric.term} className="group bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-800/50 dark:to-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{index + 1}</span>
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">{metric.term}</h3>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">{metric.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-16">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Algorithm Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left py-4 px-6 text-zinc-900 dark:text-white font-semibold">Algorithm</th>
                    <th className="text-left py-4 px-6 text-zinc-900 dark:text-white font-semibold">Average Waiting Time</th>
                    <th className="text-left py-4 px-6 text-zinc-900 dark:text-white font-semibold">Starvation</th>
                    <th className="text-left py-4 px-6 text-zinc-900 dark:text-white font-semibold">Overhead</th>
                    <th className="text-left py-4 px-6 text-zinc-900 dark:text-white font-semibold">Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-4 px-6 font-medium text-zinc-900 dark:text-white">FCFS</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">High</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">No</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Low</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Simple systems</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-4 px-6 font-medium text-zinc-900 dark:text-white">SJF</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Optimal</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Yes</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Medium</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Batch systems</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-4 px-6 font-medium text-zinc-900 dark:text-white">SRTF</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Better than SJF</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Yes</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">High</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Interactive systems</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-4 px-6 font-medium text-zinc-900 dark:text-white">Round Robin</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Depends on quantum</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">No</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Medium</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Time-sharing</td>
                  </tr>
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-4 px-6 font-medium text-zinc-900 dark:text-white">Priority</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Low for high priority</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Yes</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Medium</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">Real-time systems</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        
        
      </div>
    </div>
  );
};

export default Doc;