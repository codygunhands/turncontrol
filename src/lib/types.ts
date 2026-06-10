export type FlightStatus = 'on_time' | 'at_risk' | 'delayed' | 'critical' | 'completed';
export type SectionType = 'passenger_service' | 'flight_operations' | 'cargo' | 'maintenance' | 'ramp';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Task {
  id: string;
  name: string;
  section: SectionType;
  flightId: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: TaskStatus;
  delayMinutes: number;
  responsible: string;
  teamVehicle?: string;
  description?: string;
  notes?: string;
  dependencies?: string[];
}

export interface SectionData {
  type: SectionType;
  name: string;
  flightId: string;
  tasks: Task[];
  status: FlightStatus;
  delayMinutes: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  aircraftType: string;
  registration: string;
  gate: string;
  sta: string;
  ata?: string;
  std: string;
  etd?: string;
  atd?: string;
  plannedGroundTime: number;
  status: FlightStatus;
  sections: SectionData[];
  currentBlocker?: string;
  hasAlert: boolean;
  alertCount: number;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  flightId: string;
  flightNumber: string;
  section: SectionType;
  task?: string;
  message: string;
  time: string;
  suggestedAction: string;
}

export interface SectionReport {
  section: SectionType;
  sectionName: string;
  plannedDuration: number;
  actualDuration: number;
  variance: number;
  delayMinutes: number;
  completedTasks: number;
  totalTasks: number;
}

export interface ResponsibilityBreakdown {
  groundHandler: number;
  catering: number;
  fuelProvider: number;
  other: number;
}

export interface Report {
  id: string;
  flightId: string;
  flightNumber: string;
  airline: string;
  route: string;
  gate: string;
  aircraftType: string;
  registration: string;
  blockOnTime: string;
  blockOffTime: string;
  totalGroundStay: number;
  scheduledGroundStay: number;
  variance: number;
  departureDelay: number;
  sections: SectionReport[];
  primaryDelayCause?: string;
  primaryDelayMinutes?: number;
  secondaryDelayCause?: string;
  secondaryDelayMinutes?: number;
  otherDelayMinutes?: number;
  totalTasks: number;
  completedOnTime: number;
  completedLate: number;
  notStarted: number;
  averageDelayMinutes: number;
  responsibility: ResponsibilityBreakdown;
  operationalNotes: string[];
  generatedBy: string;
  generatedAt: string;
}

export interface TimelineActivity {
  id: string;
  name: string;
  section: SectionType;
  plannedStart: number;
  plannedEnd: number;
  actualStart?: number;
  actualEnd?: number;
  isCriticalPath: boolean;
  delayMinutes: number;
}
