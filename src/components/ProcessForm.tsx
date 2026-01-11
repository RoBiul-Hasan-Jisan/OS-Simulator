import { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Zap, ChevronRight, AlertCircle, CheckCircle, Clock, Calendar, Target, Layers } from "lucide-react";
import { ProcessFormData } from "./Scheduler";

interface Process {
  name: string;
  burstTime: string;
  arrivalTime: string;
  priority: string;
  queueLevel: string;
  timeQuantum: string;
}
interface ProcessFormProps {
  processes: ProcessFormData[];
  addProcess: (process: ProcessFormData) => void;
  algorithm: string;
}


interface AlgorithmConfig {
  needsPriority?: boolean;
  needsQueueLevel?: boolean;
  needsTimeQuantum?: boolean;
}

const ProcessForm = ({ processes, addProcess, algorithm }: ProcessFormProps) => {
  const [process, setProcess] = useState<Process>({
    name: "",
    burstTime: "",
    arrivalTime: "",
    priority: "",
    queueLevel: "1",
    timeQuantum: "2",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIXED: Algorithm-specific configurations with proper typing
  const algorithmConfigs: Record<string, AlgorithmConfig> = {
    "Priority (Preemptive)": { needsPriority: true },
    "Priority (Non-Preemptive)": { needsPriority: true },
    "MLQ": { needsQueueLevel: true },
    "MLFQ": { needsQueueLevel: true, needsTimeQuantum: true },
    "RR": { needsTimeQuantum: true },
    "FCFS": {},
    "SJF": {},
  };

  // FIXED: Safe access with fallback to empty object
  const config: AlgorithmConfig = algorithmConfigs[algorithm] || {};

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedName = process.name.trim();

    // Name validation
    if (!trimmedName) {
      newErrors.name = "Process name is required";
    } else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(trimmedName)) {
      newErrors.name = "Name must start with a letter and contain only letters and numbers";
    } else if (processes.some((p) => p.name === trimmedName)) {
      newErrors.name = `Process "${trimmedName}" already exists`;
    }

    // Numeric validations
    const burstTime = parseInt(process.burstTime);
    if (isNaN(burstTime) || burstTime <= 0) {
      newErrors.burstTime = "Burst time must be > 0";
    } else if (burstTime > 100) {
      newErrors.burstTime = "Burst time too high (max 100)";
    }

    const arrivalTime = parseInt(process.arrivalTime);
    if (isNaN(arrivalTime) || arrivalTime < 0) {
      newErrors.arrivalTime = "Arrival time must be ≥ 0";
    }

    // FIXED: Check if property exists before using it
    if (config.needsPriority) {
      const priority = parseInt(process.priority);
      if (isNaN(priority) || priority < 0) {
        newErrors.priority = "Priority must be ≥ 0 (lower = higher priority)";
      }
    }

    if (config.needsQueueLevel) {
      const queueLevel = parseInt(process.queueLevel);
      if (isNaN(queueLevel) || queueLevel < 1) {
        newErrors.queueLevel = "Queue level must be ≥ 1";
      }
    }

    if (config.needsTimeQuantum) {
      const timeQuantum = parseInt(process.timeQuantum);
      if (isNaN(timeQuantum) || timeQuantum <= 0) {
        newErrors.timeQuantum = "Time quantum must be > 0";
      } else if (timeQuantum > 20) {
        newErrors.timeQuantum = "Time quantum too high (max 20)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      toast.error("Please fix the errors below", {
        position: "top-right",
        autoClose: 3000,
        icon: <AlertCircle className="text-red-500" />,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      addProcess({ ...process, name: process.name.trim() });

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-500" size={20} />
          <span>Process <strong>{process.name.trim()}</strong> added successfully!</span>
        </div>,
        {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        }
      );

      // FIXED: Only reset fields that exist in the config
      setProcess({
        name: "",
        burstTime: "",
        arrivalTime: "",
        priority: config.needsPriority ? "" : "",
        queueLevel: config.needsQueueLevel ? "1" : "",
        timeQuantum: config.needsTimeQuantum ? "2" : "",
      });
      setErrors({});
    } catch (error) {
      toast.error("Failed to add process. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, field: keyof Process) => {
    setProcess({
      ...process,
      [field]: e.target.value,
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const suggestNextName = () => {
    const existingNames = processes.map(p => p.name);
    let i = 1;
    while (existingNames.includes(`P${i}`)) i++;
    setProcess(prev => ({ ...prev, name: `P${i}` }));
  };

  return (
    <div className="p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Add New Process</h2>
          <p className="text-gray-400 text-sm">
            Configure process parameters for <span className="font-semibold text-blue-400">{algorithm}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Process Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Process Name
            <button
              type="button"
              onClick={suggestNextName}
              className="ml-3 text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
            >
              Suggest Name
            </button>
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={process.name}
              onChange={(e) => handleInputChange(e, 'name')}
              placeholder="e.g., P1, ProcessA, Task1"
              className={`flex-1 p-3 rounded-lg bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
            />
          </div>
          {errors.name && (
            <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              {errors.name}
            </div>
          )}
        </div>

        {/* Core Timing Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                Burst Time (ms)
              </div>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={process.burstTime}
              onChange={(e) => handleInputChange(e, 'burstTime')}
              placeholder="e.g., 5"
              className={`w-full p-3 rounded-lg bg-gray-800 border ${errors.burstTime ? 'border-red-500' : 'border-gray-700'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
            />
            {errors.burstTime && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle size={14} />
                {errors.burstTime}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-green-400" />
                Arrival Time (ms)
              </div>
            </label>
            <input
              type="number"
              min="0"
              value={process.arrivalTime}
              onChange={(e) => handleInputChange(e, 'arrivalTime')}
              placeholder="e.g., 0"
              className={`w-full p-3 rounded-lg bg-gray-800 border ${errors.arrivalTime ? 'border-red-500' : 'border-gray-700'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
            />
            {errors.arrivalTime && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle size={14} />
                {errors.arrivalTime}
              </div>
            )}
          </div>
        </div>

        {/* FIXED: Only show algorithm settings section if any config exists */}
        {(config.needsPriority || config.needsQueueLevel || config.needsTimeQuantum) && (
          <div className="border-t border-gray-800 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <ChevronRight className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-gray-300">Algorithm-specific Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* FIXED: Conditional rendering with optional chaining */}
              {config.needsPriority && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-yellow-400" />
                      Priority (Lower = Higher)
                    </div>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={process.priority}
                    onChange={(e) => handleInputChange(e, 'priority')}
                    placeholder="e.g., 1"
                    className={`w-full p-3 rounded-lg bg-gray-800 border ${errors.priority ? 'border-red-500' : 'border-gray-700'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                  />
                  {errors.priority && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle size={14} />
                      {errors.priority}
                    </div>
                  )}
                </div>
              )}

              {config.needsQueueLevel && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-purple-400" />
                      Queue Level
                    </div>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={process.queueLevel}
                    onChange={(e) => handleInputChange(e, 'queueLevel')}
                    placeholder="e.g., 1"
                    className={`w-full p-3 rounded-lg bg-gray-800 border ${errors.queueLevel ? 'border-red-500' : 'border-gray-700'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                  />
                  {errors.queueLevel && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle size={14} />
                      {errors.queueLevel}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Higher levels = lower priority</p>
                </div>
              )}

              {config.needsTimeQuantum && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-orange-400" />
                      Time Quantum (ms)
                    </div>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={process.timeQuantum}
                    onChange={(e) => handleInputChange(e, 'timeQuantum')}
                    placeholder="e.g., 2"
                    className={`w-full p-3 rounded-lg bg-gray-800 border ${errors.timeQuantum ? 'border-red-500' : 'border-gray-700'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                  />
                  {errors.timeQuantum && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle size={14} />
                      {errors.timeQuantum}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              isSubmitting
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding Process...
              </>
            ) : (
              <>
                <Plus size={20} />
                Add Process
                <ChevronRight size={18} className="opacity-80" />
              </>
            )}
          </button>
          
          {processes.length > 0 && (
            <div className="mt-4 text-center text-gray-400 text-sm">
              <span className="inline-block px-3 py-1 bg-gray-800 rounded-full">
                {processes.length} process{processes.length !== 1 ? 'es' : ''} configured
              </span>
            </div>
          )}
        </div>
      </form>

      {/* Requirements Hint */}
      <div className="mt-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Requirements:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li className="flex items-center gap-2">
            <CheckCircle size={12} className="text-green-400" />
            Process name must be unique and alphanumeric
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={12} className="text-green-400" />
            All times are in milliseconds (ms)
          </li>
          {/* FIXED: Conditional rendering based on config */}
          {config.needsPriority && (
            <li className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-400" />
              Lower priority number = higher priority
            </li>
          )}
          {config.needsTimeQuantum && (
            <li className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-400" />
              Time quantum determines slice duration
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProcessForm;