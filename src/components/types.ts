export interface Process {
  id: string;
  name: string;
  burstTime: number;
  arrivalTime: number;
  priority: number;
  queueLevel?: string;
  timeQuantum?: string;
}

export interface ProcessInput {
  name: string;
  burstTime: string;
  arrivalTime: string;
  priority: string;
  queueLevel?: string;
  timeQuantum?: string;
}