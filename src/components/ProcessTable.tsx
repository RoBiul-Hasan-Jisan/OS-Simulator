import { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  
  Search, 
  BarChart3, 
  Clock, 
  Zap, 
  ChevronUp, 
  ChevronDown,
  
  Download,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';

interface Process {
  name: string;
  burstTime: number;
  arrivalTime?: number;
  priority?: number;
  queueLevel?: number;
}

interface ProcessTableProps {
  processes: Process[];
}

type SortField = 'name' | 'burstTime' | 'arrivalTime' | 'priority';
type SortDirection = 'asc' | 'desc';

const ProcessTable = ({ processes }: ProcessTableProps) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    burstTime: true,
    arrivalTime: false,
    priority: false,
    queueLevel: false,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const burstTimes = processes.map(p => p.burstTime);
    const totalBurstTime = burstTimes.reduce((a, b) => a + b, 0);
    const avgBurstTime = totalBurstTime / processes.length || 0;
    const maxBurstTime = Math.max(...burstTimes);
    const minBurstTime = Math.min(...burstTimes);
    
    return {
      totalBurstTime,
      avgBurstTime,
      maxBurstTime,
      minBurstTime,
      processCount: processes.length
    };
  }, [processes]);

  // Sort and filter processes
  const filteredAndSortedProcesses = useMemo(() => {
    const filtered = processes.filter(process =>
      process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      process.burstTime.toString().includes(searchQuery)
    );

    return [...filtered].sort((a, b) => {
      const aValue = a[sortField] ?? 0;
      const bValue = b[sortField] ?? 0;
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [processes, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="opacity-50" />;
    return sortDirection === 'asc' ? 
      <ChevronUp size={14} className="text-blue-400" /> : 
      <ChevronDown size={14} className="text-blue-400" />;
  };

  const exportData = () => {
    const csv = [
      ['Process', 'Burst Time', 'Arrival Time', 'Priority', 'Queue Level'].join(','),
      ...filteredAndSortedProcesses.map(p => 
        [p.name, p.burstTime, p.arrivalTime ?? 'N/A', p.priority ?? 'N/A', p.queueLevel ?? 'N/A'].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processes.csv';
    a.click();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-500/20 overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      
      {/* Header with stats */}
      <div className="relative p-8 border-b border-indigo-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Activity className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Process Analytics
              </h2>
              <p className="text-indigo-300 text-sm mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {filteredAndSortedProcesses.length} active
                </span>
                <span className="text-indigo-400">·</span>
                <span>{processes.length} total processes</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportData}
              className="group px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
            >
              <Download size={18} className="group-hover:animate-bounce" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats cards - Modern design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-2xl p-5 border border-blue-400/20 hover:border-blue-400/40 transition-all hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 ring-2 ring-blue-400/30">
                    <Zap className="text-blue-300" size={20} />
                  </div>
                  <Sparkles className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                </div>
                <p className="text-sm text-blue-200/70 mb-1 font-medium">Total Burst</p>
                <p className="text-2xl font-bold text-white">{stats.totalBurstTime}</p>
                <p className="text-xs text-blue-300/60 mt-1">milliseconds</p>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-2xl p-5 border border-green-400/20 hover:border-green-400/40 transition-all hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2.5 rounded-xl bg-green-500/20 ring-2 ring-green-400/30">
                    <Clock className="text-green-300" size={20} />
                  </div>
                  <TrendingUp className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                </div>
                <p className="text-sm text-green-200/70 mb-1 font-medium">Average Time</p>
                <p className="text-2xl font-bold text-white">{stats.avgBurstTime.toFixed(1)}</p>
                <p className="text-xs text-green-300/60 mt-1">milliseconds</p>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-2xl p-5 border border-purple-400/20 hover:border-purple-400/40 transition-all hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 ring-2 ring-purple-400/30">
                    <BarChart3 className="text-purple-300" size={20} />
                  </div>
                  <ChevronUp className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                </div>
                <p className="text-sm text-purple-200/70 mb-1 font-medium">Maximum</p>
                <p className="text-2xl font-bold text-white">{stats.maxBurstTime}</p>
                <p className="text-xs text-purple-300/60 mt-1">milliseconds</p>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-600/5 backdrop-blur-sm rounded-2xl p-5 border border-pink-400/20 hover:border-pink-400/40 transition-all hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/0 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2.5 rounded-xl bg-pink-500/20 ring-2 ring-pink-400/30">
                    <BarChart3 className="text-pink-300" size={20} />
                  </div>
                  <ChevronDown className="text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                </div>
                <p className="text-sm text-pink-200/70 mb-1 font-medium">Minimum</p>
                <p className="text-2xl font-bold text-white">{stats.minBurstTime}</p>
                <p className="text-xs text-pink-300/60 mt-1">milliseconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and filters - Enhanced */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by process name or burst time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-indigo-900/30 backdrop-blur-sm border border-indigo-500/30 rounded-xl focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-indigo-400/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-white transition-colors"
              >
                <span className="text-sm">✕</span>
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setVisibleColumns(prev => ({ ...prev, arrivalTime: !prev.arrivalTime }))}
              className={`px-5 py-3.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg ${
                visibleColumns.arrivalTime 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30 scale-105' 
                  : 'bg-indigo-900/40 backdrop-blur-sm border border-indigo-500/30 text-indigo-300 hover:bg-indigo-800/40 hover:border-indigo-400/40'
              }`}
            >
              {visibleColumns.arrivalTime ? <Eye size={18} /> : <EyeOff size={18} />}
              <span className="hidden sm:inline">Arrival</span>
            </button>
            
            <button
              onClick={() => setVisibleColumns(prev => ({ ...prev, priority: !prev.priority }))}
              className={`px-5 py-3.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg ${
                visibleColumns.priority 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/30 scale-105' 
                  : 'bg-indigo-900/40 backdrop-blur-sm border border-indigo-500/30 text-indigo-300 hover:bg-indigo-800/40 hover:border-indigo-400/40'
              }`}
            >
              {visibleColumns.priority ? <Eye size={18} /> : <EyeOff size={18} />}
              <span className="hidden sm:inline">Priority</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table - Modern scrollable design */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-indigo-900/40 backdrop-blur-sm border-b border-indigo-500/20">
              <th className="p-5 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 font-semibold text-indigo-200 hover:text-white transition-all group"
                >
                  Process 
                  <span className="group-hover:scale-110 transition-transform">
                    {getSortIcon('name')}
                  </span>
                </button>
              </th>
              <th className="p-5 text-left">
                <button
                  onClick={() => handleSort('burstTime')}
                  className="flex items-center gap-2 font-semibold text-indigo-200 hover:text-white transition-all group"
                >
                  Burst Time 
                  <span className="group-hover:scale-110 transition-transform">
                    {getSortIcon('burstTime')}
                  </span>
                </button>
              </th>
              
              {visibleColumns.arrivalTime && (
                <th className="p-5 text-left">
                  <button
                    onClick={() => handleSort('arrivalTime')}
                    className="flex items-center gap-2 font-semibold text-indigo-200 hover:text-white transition-all group"
                  >
                    Arrival Time 
                    <span className="group-hover:scale-110 transition-transform">
                      {getSortIcon('arrivalTime')}
                    </span>
                  </button>
                </th>
              )}
              
              {visibleColumns.priority && (
                <th className="p-5 text-left">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-2 font-semibold text-indigo-200 hover:text-white transition-all group"
                  >
                    Priority 
                    <span className="group-hover:scale-110 transition-transform">
                      {getSortIcon('priority')}
                    </span>
                  </button>
                </th>
              )}
              
              <th className="p-5 text-left">
                <span className="font-semibold text-indigo-200">Utilization</span>
              </th>
            </tr>
          </thead>
          
          <tbody>
            {filteredAndSortedProcesses.map((process, index) => {
              const burstPercentage = (process.burstTime / stats.maxBurstTime) * 100;
              
              return (
                <tr 
                  key={index}
                  className="group border-b border-indigo-500/10 hover:bg-indigo-900/20 transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all">
                        <span className="font-bold text-white text-lg">{process.name.charAt(1) || 'P'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg group-hover:text-blue-300 transition-colors">{process.name}</p>
                        <p className="text-xs text-indigo-400">Process #{index + 1}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-5">
                    <div className="flex flex-col">
                      <p className="font-bold text-white text-lg">{process.burstTime} <span className="text-sm text-indigo-300">ms</span></p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="px-2 py-0.5 bg-indigo-500/20 rounded-md">
                          <p className="text-xs text-indigo-300 font-medium">
                            {((process.burstTime / stats.totalBurstTime) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <span className="text-xs text-indigo-400/60">of total</span>
                      </div>
                    </div>
                  </td>
                  
                  {visibleColumns.arrivalTime && (
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all ${
                        process.arrivalTime === 0 
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-400/30' 
                          : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-400/30'
                      }`}>
                        <Clock size={14} />
                        {process.arrivalTime ?? 'N/A'} ms
                      </span>
                    </td>
                  )}
                  
                  {visibleColumns.priority && (
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all ${
                        (process.priority || 0) <= 3 
                          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-400/30' 
                          : (process.priority || 0) <= 7 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border border-yellow-400/30' 
                          : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-400/30'
                      }`}>
                        <Activity size={14} />
                        {process.priority ?? 'N/A'}
                      </span>
                    </td>
                  )}
                  
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-indigo-950/50 rounded-full overflow-hidden border border-indigo-500/20">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/50"
                          style={{ width: `${Math.min(burstPercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white min-w-[3.5ch] text-right">
                        {Math.round(burstPercentage)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state - Enhanced */}
      {filteredAndSortedProcesses.length === 0 && (
        <div className="p-16 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mx-auto mb-6 flex items-center justify-center border border-indigo-400/30 shadow-lg">
            <Search className="text-indigo-300" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No processes found</h3>
          <p className="text-indigo-300 max-w-md mx-auto text-lg">
            {searchQuery 
              ? `No matches for "${searchQuery}". Try adjusting your search.`
              : 'No processes available. Add processes to begin analysis.'}
          </p>
        </div>
      )}

      {/* Footer - Redesigned */}
      <div className="p-6 border-t border-indigo-500/20 bg-indigo-950/30 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 backdrop-blur-sm">
              <span className="text-indigo-300">Sorted by: </span>
              <span className="font-bold text-white">{sortField}</span>
              <span className="text-indigo-400 mx-2">·</span>
              <span className="text-indigo-300">{sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"></div>
              <span className="text-indigo-300">Low usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"></div>
              <span className="text-indigo-300">Medium usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/50"></div>
              <span className="text-indigo-300">High usage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessTable;