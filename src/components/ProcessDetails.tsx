import { ProcessDetailsData } from "./Scheduler";



interface ProcessDetailsProps {
 processes: ProcessDetailsData[];
  setProcesses: (processes: ProcessDetailsData[]) => void;
}

const ProcessDetails = ({ processes, setProcesses }: ProcessDetailsProps) => {
  const clearProcesses = () => {
    if (window.confirm('Are you sure you want to clear all processes?')) {
      setProcesses([]);
    }
  };

  const removeProcess = (index: number) => {
    setProcesses(processes.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg bg-white text-black dark:bg-gray-900 dark:text-white transition-all min-h-[24rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Process Details</h2>
        {processes.length > 0 && (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            {processes.length} {processes.length === 1 ? 'Process' : 'Processes'}
          </span>
        )}
      </div>

      {processes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="w-24 h-24 text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-center text-lg">No processes added yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-center text-sm mt-2">Add a process to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {processes.map((p, index) => (
              <div
                key={index}
                className="group relative p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeProcess(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                  aria-label={`Remove ${p.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Process name badge */}
                <div className="flex items-center justify-center mb-4">
                  <span className="px-4 py-2 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-md">
                    {p.name}
                  </span>
                </div>

                {/* Process details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Burst Time:</span>
                    <span className="font-semibold">{p.burstTime}ms</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Arrival Time:</span>
                    <span className="font-semibold">{p.arrivalTime}ms</span>
                  </div>

                  {p.priority && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                      <span className="font-semibold px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                        {p.priority}
                      </span>
                    </div>
                  )}

                  {p.queueLevel && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Queue Level:</span>
                      <span className="font-semibold px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                        {p.queueLevel}
                      </span>
                    </div>
                  )}

                  {p.timeQuantum && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Time Quantum:</span>
                      <span className="font-semibold">{p.timeQuantum}ms</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={clearProcesses}
            className="mt-4 py-3 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Processes
          </button>
        </div>
      )}
    </div>
  );
};

export default ProcessDetails;