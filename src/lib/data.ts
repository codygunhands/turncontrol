import type {
  Flight,
  SectionData,
  SectionType,
  Task,
  TaskStatus,
  Alert,
  Report,
  TimelineActivity,
} from "./types";
import { addMin } from "./utils";

// ─── Time helpers ─────────────────────────────────────────────────────────────

function t(offsetMin: number): string {
  return new Date(Date.now() + offsetMin * 60_000).toISOString();
}

// ─── Task factory ─────────────────────────────────────────────────────────────

interface TaskSpec {
  id: string;
  name: string;
  startOffset: number;
  duration: number;
  responsible: string;
  teamVehicle?: string;
  description?: string;
  dependencies?: string[];
  notes?: string;
}

type TaskState = "completed" | "in_progress" | "not_started" | "delayed";

function buildTask(
  spec: TaskSpec,
  flightId: string,
  section: SectionType,
  ata: Date,
  state: TaskState,
  delayMin = 0,
  overrideNotes?: string,
): Task {
  const plannedStart = addMin(ata, spec.startOffset);
  const plannedEnd   = addMin(ata, spec.startOffset + spec.duration);

  let actualStart: string | undefined;
  let actualEnd:   string | undefined;
  let status: TaskStatus;

  switch (state) {
    case "completed":
      actualStart = addMin(ata, spec.startOffset + Math.min(delayMin, 2));
      actualEnd   = addMin(ata, spec.startOffset + spec.duration + delayMin);
      status      = "completed";
      break;
    case "in_progress":
      actualStart = addMin(ata, spec.startOffset + delayMin);
      status      = delayMin > 0 ? "delayed" : "in_progress";
      break;
    case "delayed":
      actualStart = addMin(ata, spec.startOffset + delayMin);
      status      = "delayed";
      break;
    default:
      status = "not_started";
  }

  return {
    id: `${flightId}-${spec.id}`,
    name: spec.name,
    section,
    flightId,
    plannedStart,
    plannedEnd,
    actualStart,
    actualEnd,
    status,
    delayMinutes: delayMin,
    responsible: spec.responsible,
    teamVehicle: spec.teamVehicle,
    description: spec.description,
    notes: overrideNotes ?? spec.notes,
    dependencies: spec.dependencies?.map((d) => `${flightId}-${d}`),
  };
}

// ─── Section task templates ────────────────────────────────────────────────────

// Passenger Service — 8 tasks (matches mockup "5/8 Tasks" for TG409)
const PAX_SPECS: TaskSpec[] = [
  { id: "pax-1", name: "Check-in Closeout",          startOffset: 0,  duration: 5,  responsible: "Passenger Services",        description: "Confirm check-in counters are closed and passenger manifest is finalised." },
  { id: "pax-2", name: "FIDS Update",                startOffset: 3,  duration: 3,  responsible: "Passenger Services",        description: "Update flight information display system with current flight status and gate." },
  { id: "pax-3", name: "Special Assistance",         startOffset: 5,  duration: 20, responsible: "Passenger Services",        description: "Coordinate and complete wheelchair, WCHR, and WCHC passenger assistance." },
  { id: "pax-4", name: "Gate Open",                  startOffset: 50, duration: 5,  responsible: "Gate Agent",                description: "Open departure gate and begin pre-boarding announcements." },
  { id: "pax-5", name: "Priority Boarding",          startOffset: 53, duration: 5,  responsible: "Gate Agent",                description: "Board priority passengers: families, business class, elite frequent flyers.", dependencies: ["pax-4"] },
  { id: "pax-6", name: "Passenger Boarding Start",   startOffset: 58, duration: 2,  responsible: "Gate Agent",                description: "Begin general passenger boarding by row/zone.", dependencies: ["pax-5"] },
  { id: "pax-7", name: "Passenger Boarding Complete",startOffset: 80, duration: 5,  responsible: "Gate Agent",                description: "Confirm all boarded passengers are seated and stow carry-on luggage.", dependencies: ["pax-6"] },
  { id: "pax-8", name: "Door Close",                 startOffset: 90, duration: 3,  responsible: "Cabin Crew / Dispatcher",   description: "Secure all cabin doors and confirm aircraft ready for pushback.", dependencies: ["pax-7"] },
];

// Flight Operations — 6 tasks
const OPS_SPECS: TaskSpec[] = [
  { id: "ops-1", name: "Crew at Office",           startOffset: 5,  duration: 10, responsible: "Flight Crew",                 description: "Flight crew report to airline operations office for pre-flight admin." },
  { id: "ops-2", name: "Crew Briefing",            startOffset: 15, duration: 20, responsible: "Captain / First Officer",     description: "Conduct full pre-departure crew briefing covering route, weather, and NOTAMs.", dependencies: ["ops-1"] },
  { id: "ops-3", name: "Flight Plan Review",       startOffset: 15, duration: 15, responsible: "Captain",                    description: "Review and sign off filed flight plan and fuel requirements.", dependencies: ["ops-1"] },
  { id: "ops-4", name: "Weather Review",           startOffset: 20, duration: 15, responsible: "Flight Dispatch",            description: "Review significant weather, SIGMETs, and destination aerodrome conditions." },
  { id: "ops-5", name: "Load Sheet Confirmation",  startOffset: 72, duration: 10, responsible: "Load Control / Dispatcher",  description: "Confirm and sign final load sheet and trim sheet." },
  { id: "ops-6", name: "Pilots at Aircraft",       startOffset: 82, duration: 5,  responsible: "Flight Crew",                description: "Crew proceed to aircraft for pre-flight checks and cockpit preparation.", dependencies: ["ops-2", "ops-5"] },
];

// Cargo — 7 tasks (matches mockup "Cargo Unload, Baggage Unload, PAX Baggage Transfer, ULD...")
const CARGO_SPECS: TaskSpec[] = [
  { id: "cgo-1", name: "Cargo Unload",            startOffset: 5,  duration: 25, responsible: "Ramp / Cargo Handler",       teamVehicle: "Team A / Belt Loader",    description: "Offload all inbound cargo containers and loose cargo from aircraft holds." },
  { id: "cgo-2", name: "Baggage Unload",          startOffset: 5,  duration: 20, responsible: "Ramp Handler",              teamVehicle: "Team B / Belt Loader",    description: "Offload all checked baggage from inbound flight to baggage claim." },
  { id: "cgo-3", name: "PAX Baggage Transfer",    startOffset: 10, duration: 15, responsible: "Ramp Handler",              teamVehicle: "Team B / Baggage Cart",   description: "Transfer connecting passenger baggage to outbound flight or baggage claim." },
  { id: "cgo-4", name: "ULD Build / Breakdown",   startOffset: 22, duration: 20, responsible: "Cargo Loader",              teamVehicle: "LD-01 / Cargo Team",      description: "Break down inbound ULDs and build new ULD positions for outbound cargo.", dependencies: ["cgo-1"] },
  { id: "cgo-5", name: "Cargo Load",              startOffset: 40, duration: 25, responsible: "Cargo Loader",              teamVehicle: "LD-01 / Team B",          description: "Load and mail to outbound flight according to load sheet.", dependencies: ["cgo-4"] },
  { id: "cgo-6", name: "Baggage Load",            startOffset: 40, duration: 25, responsible: "Baggage Handler",           teamVehicle: "Team C / Belt Loader",    description: "Load checked baggage into outbound aircraft holds.", dependencies: ["cgo-2"] },
  { id: "cgo-7", name: "Weight & Balance Update", startOffset: 68, duration: 10, responsible: "Load Control",              teamVehicle: "Load Control Station",    description: "Finalise weight and balance calculation and submit to flight crew.", dependencies: ["cgo-5", "cgo-6"] },
];

// Maintenance — 5 tasks
const MAINT_SPECS: TaskSpec[] = [
  { id: "mnt-1", name: "Transit Check",         startOffset: 5,  duration: 20, responsible: "Line Maintenance",          description: "Perform standard transit inspection of aircraft exterior, engines, and fluid levels." },
  { id: "mnt-2", name: "Defect Review",         startOffset: 15, duration: 20, responsible: "Tech Maintenance",          description: "Review technical log defects raised by inbound crew. Assess action required.", dependencies: ["mnt-1"] },
  { id: "mnt-3", name: "MEL Check",             startOffset: 20, duration: 20, responsible: "Tech Maintenance",          description: "Verify all Minimum Equipment List items are within dispatch limits." },
  { id: "mnt-4", name: "Engineering Clearance", startOffset: 45, duration: 15, responsible: "Maintenance Engineer",      description: "Issue engineering clearance for dispatch. Sign off maintenance release.", dependencies: ["mnt-2", "mnt-3"] },
  { id: "mnt-5", name: "Final Walkaround",      startOffset: 85, duration: 8,  responsible: "Captain / Line Maint",     description: "Captain and maintenance engineer conduct pre-departure walkaround inspection.", dependencies: ["mnt-4"] },
];

// Ramp Supervisor — 10 tasks (matches mockup "6/10 Tasks")
const RAMP_SPECS: TaskSpec[] = [
  { id: "rmp-1",  name: "Aircraft Arrival Confirmation", startOffset: 0,  duration: 3,  responsible: "Ramp Supervisor",               description: "Confirm aircraft on blocks. Record actual block-on time in system." },
  { id: "rmp-2",  name: "Chocks On",                    startOffset: 2,  duration: 5,  responsible: "Ramp Agent",                    description: "Position and secure wheel chocks fore and aft of all main gear.", dependencies: ["rmp-1"] },
  { id: "rmp-3",  name: "Equipment Positioning",        startOffset: 5,  duration: 15, responsible: "Ground Equipment Operator",      description: "Position all ground equipment: stairs/jetway, GPU, ASU, belt loaders.", dependencies: ["rmp-2"] },
  { id: "rmp-4",  name: "GPU Connect",                  startOffset: 8,  duration: 5,  responsible: "Ground Equipment Operator",      description: "Connect ground power unit and transfer from APU to external power." },
  { id: "rmp-5",  name: "Turnaround Coordination",      startOffset: 8,  duration: 15, responsible: "Ramp Supervisor",               description: "Brief all section supervisors. Confirm turnaround timeline and critical path.", dependencies: ["rmp-1"] },
  { id: "rmp-6",  name: "Section Status Check",         startOffset: 35, duration: 5,  responsible: "Ramp Supervisor",               description: "Check-in with all departments. Flag any delays or blockers to operations." },
  { id: "rmp-7",  name: "Delay Reason Confirmation",    startOffset: 60, duration: 5,  responsible: "Ramp Supervisor / Operations",  description: "Confirm delay reason code with operations control and update ACARS." },
  { id: "rmp-8",  name: "Pushback Ready",               startOffset: 85, duration: 5,  responsible: "Ramp Supervisor",               description: "Confirm pushback crew and tug are positioned. Request Apron Control clearance.", dependencies: ["rmp-7"] },
  { id: "rmp-9",  name: "Chocks Off",                   startOffset: 92, duration: 3,  responsible: "Ramp Agent",                   description: "Remove wheel chocks on crew/tug confirmation. Aircraft ready to move.", dependencies: ["rmp-8"] },
  { id: "rmp-10", name: "Final Report",                 startOffset: 95, duration: 5,  responsible: "Ramp Supervisor",              description: "Submit final turnaround report: block times, delays, discrepancies." },
];

// ─── Section builder ──────────────────────────────────────────────────────────

type SectionStates = {
  pax: TaskState[];
  ops: TaskState[];
  cgo: TaskState[];
  mnt: TaskState[];
  rmp: TaskState[];
};

type SectionDelays = {
  pax?: (number | undefined)[];
  ops?: (number | undefined)[];
  cgo?: (number | undefined)[];
  mnt?: (number | undefined)[];
  rmp?: (number | undefined)[];
};

type SectionNotes = {
  pax?: (string | undefined)[];
  ops?: (string | undefined)[];
  cgo?: (string | undefined)[];
  mnt?: (string | undefined)[];
  rmp?: (string | undefined)[];
};

function getSectionNameLocal(type: SectionType): string {
  const n: Record<SectionType, string> = {
    passenger_service: "Passenger Service",
    flight_operations: "Flight Operations",
    cargo: "Cargo",
    maintenance: "Maintenance",
    ramp: "Ramp Supervisor",
  };
  return n[type];
}

function buildSections(
  flightId: string,
  ata: Date,
  states: SectionStates,
  delays: SectionDelays = {},
  notes: SectionNotes = {},
): SectionData[] {
  const make = (
    section: SectionType,
    specs: TaskSpec[],
    taskStates: TaskState[],
    taskDelays: (number | undefined)[] = [],
    taskNotes: (string | undefined)[] = [],
  ): SectionData => {
    const tasks = specs.map((spec, i) =>
      buildTask(spec, flightId, section, ata, taskStates[i] ?? "not_started", taskDelays[i] ?? 0, taskNotes[i]),
    );

    const completed = tasks.filter((t) => t.status === "completed").length;
    const total     = tasks.length;
    const maxDelay  = Math.max(0, ...tasks.map((t) => t.delayMinutes));

    let status: Flight["status"];
    if (tasks.some((t) => t.status === "blocked")) status = "critical";
    else if (maxDelay >= 15) status = "delayed";
    else if (maxDelay >= 5 || (maxDelay > 0 && completed < total)) status = "at_risk";
    else if (completed === total) status = "completed";
    else status = "on_time";

    return { type: section, name: getSectionNameLocal(section), flightId, tasks, status, delayMinutes: maxDelay };
  };

  return [
    make("passenger_service", PAX_SPECS,   states.pax, delays.pax,  notes.pax),
    make("flight_operations", OPS_SPECS,   states.ops, delays.ops,  notes.ops),
    make("cargo",             CARGO_SPECS, states.cgo, delays.cgo,  notes.cgo),
    make("maintenance",       MAINT_SPECS, states.mnt, delays.mnt,  notes.mnt),
    make("ramp",              RAMP_SPECS,  states.rmp, delays.rmp,  notes.rmp),
  ];
}

// ─── FLIGHTS ─────────────────────────────────────────────────────────────────
// 12 total: 5 ON TIME · 3 AT RISK · 2 DELAYED · 2 COMPLETED

export function generateFlights(): Flight[] {

  // ── TG409  BKK→SIN  Thai Airways  A320-200  AT RISK ────────────────────────
  const tg409_ata = new Date(t(-95));
  const tg409_std = t(12);
  const tg409_sections = buildSections(
    "tg409", tg409_ata,
    {
      pax: ["completed", "completed", "completed", "completed", "completed", "in_progress", "not_started", "not_started"],
      ops: ["completed", "completed", "completed", "completed", "completed", "in_progress"],
      cgo: ["completed", "completed", "completed", "completed", "in_progress", "not_started", "not_started"],
      mnt: ["completed", "completed", "completed", "completed", "not_started"],
      rmp: ["completed", "completed", "completed", "completed", "completed", "completed", "in_progress", "not_started", "not_started", "not_started"],
    },
    {
      pax: [0, 0, 0, 0, 0, 7, 0, 0],
      cgo: [0, 0, 0, 0, 9, 0, 0],
      rmp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      pax: [undefined, undefined, undefined, undefined, undefined, "Boarding delayed — W&B not yet confirmed by load control", undefined, undefined],
      cgo: [undefined, undefined, undefined, undefined, "Waiting for late arriving cargo from offload. Loader crew reassigned from bay C4.", undefined, undefined],
    },
  );

  const tg409: Flight = {
    id: "tg409",
    flightNumber: "TG409",
    airline: "Thai Airways",
    airlineCode: "TG",
    origin: "BKK",
    originCity: "Bangkok",
    destination: "SIN",
    destinationCity: "Singapore",
    aircraftType: "A320-200",
    registration: "HS-TXA",
    gate: "C7",
    sta: t(-100),
    ata: tg409_ata.toISOString(),
    std: tg409_std,
    etd: t(22),
    plannedGroundTime: 100,
    status: "at_risk",
    sections: tg409_sections,
    currentBlocker: "W&B update pending — boarding delayed",
    hasAlert: true,
    alertCount: 2,
  };

  // ── NH850  BKK→HND  ANA  B787-9  ON TIME ───────────────────────────────────
  const nh850_ata = new Date(t(-62));
  const nh850_sections = buildSections(
    "nh850", nh850_ata,
    {
      pax: ["completed", "completed", "completed", "not_started", "not_started", "not_started", "not_started", "not_started"],
      ops: ["completed", "completed", "completed", "completed", "not_started", "not_started"],
      cgo: ["completed", "completed", "completed", "in_progress", "not_started", "not_started", "not_started"],
      mnt: ["completed", "completed", "in_progress", "not_started", "not_started"],
      rmp: ["completed", "completed", "completed", "completed", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started"],
    },
  );

  const nh850: Flight = {
    id: "nh850",
    flightNumber: "NH850",
    airline: "All Nippon Airways",
    airlineCode: "NH",
    origin: "BKK",
    originCity: "Bangkok",
    destination: "HND",
    destinationCity: "Tokyo Haneda",
    aircraftType: "B787-9",
    registration: "JA838A",
    gate: "E2",
    sta: t(-67),
    ata: nh850_ata.toISOString(),
    std: t(48),
    etd: t(48),
    plannedGroundTime: 110,
    status: "on_time",
    sections: nh850_sections,
    hasAlert: false,
    alertCount: 0,
  };

  // ── FD352  DMK→BKK  AirAsia  A320-200  AT RISK ────────────────────────────
  const fd352_ata = new Date(t(-55));
  const fd352_sections = buildSections(
    "fd352", fd352_ata,
    {
      pax: ["completed", "completed", "completed", "not_started", "not_started", "not_started", "not_started", "not_started"],
      ops: ["completed", "completed", "completed", "in_progress", "not_started", "not_started"],
      cgo: ["completed", "completed", "in_progress", "not_started", "not_started", "not_started", "not_started"],
      mnt: ["completed", "in_progress", "not_started", "not_started", "not_started"],
      rmp: ["completed", "completed", "in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started", "not_started"],
    },
    { cgo: [0, 0, 6, 0, 0, 0, 0] },
    { cgo: [undefined, undefined, "PAX baggage transfer delayed — connecting flight arrival late", undefined, undefined, undefined, undefined] },
  );

  const fd352: Flight = {
    id: "fd352",
    flightNumber: "FD352",
    airline: "AirAsia",
    airlineCode: "FD",
    origin: "DMK",
    originCity: "Bangkok Don Mueang",
    destination: "BKK",
    destinationCity: "Bangkok Suvarnabhumi",
    aircraftType: "A320-200",
    registration: "HS-ABZ",
    gate: "A1",
    sta: t(-60),
    ata: fd352_ata.toISOString(),
    std: t(44),
    etd: t(50),
    plannedGroundTime: 99,
    status: "at_risk",
    sections: fd352_sections,
    currentBlocker: "PAX baggage transfer delayed — connecting pax inbound",
    hasAlert: true,
    alertCount: 1,
  };

  // ── SQ979  BKK→SIN  Singapore Airlines  A350-900  DELAYED ─────────────────
  const sq979_ata = new Date(t(-58));
  const sq979_sections = buildSections(
    "sq979", sq979_ata,
    {
      pax: ["completed", "completed", "completed", "in_progress", "not_started", "not_started", "not_started", "not_started"],
      ops: ["completed", "completed", "completed", "completed", "not_started", "not_started"],
      cgo: ["completed", "completed", "completed", "completed", "in_progress", "delayed",     "not_started"],
      mnt: ["completed", "completed", "completed", "not_started", "not_started"],
      rmp: ["completed", "completed", "completed", "completed", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started"],
    },
    { cgo: [0, 0, 0, 0, 12, 12, 0] },
    { cgo: [undefined, undefined, undefined, undefined, "Cargo load 12 min behind schedule — loader crew shortage at bay D4", "Baggage load waiting on cargo hold positions", undefined] },
  );

  const sq979: Flight = {
    id: "sq979",
    flightNumber: "SQ979",
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    origin: "BKK",
    originCity: "Bangkok",
    destination: "SIN",
    destinationCity: "Singapore",
    aircraftType: "A350-900",
    registration: "9V-SME",
    gate: "D4",
    sta: t(-63),
    ata: sq979_ata.toISOString(),
    std: t(22),
    etd: t(34),
    plannedGroundTime: 80,
    status: "delayed",
    sections: sq979_sections,
    currentBlocker: "Cargo load 12 min behind — boarding blocked",
    hasAlert: true,
    alertCount: 1,
  };

  // ── VZ810  BKK→SGN  VietJet Air  A321-200  DELAYED ────────────────────────
  const vz810_ata = new Date(t(-32));
  const vz810_sections = buildSections(
    "vz810", vz810_ata,
    {
      pax: ["completed", "delayed", "not_started", "not_started", "not_started", "not_started", "not_started", "not_started"],
      ops: ["completed", "in_progress", "not_started", "not_started", "not_started", "not_started"],
      cgo: ["in_progress", "in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started"],
      mnt: ["in_progress", "not_started", "not_started", "not_started", "not_started"],
      rmp: ["completed", "completed", "in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started", "not_started"],
    },
    { pax: [0, 16, 0, 0, 0, 0, 0, 0] },
    { pax: [undefined, "FIDS update delayed — DCS system timeout. Gate info not showing on displays.", undefined, undefined, undefined, undefined, undefined, undefined] },
  );

  const vz810: Flight = {
    id: "vz810",
    flightNumber: "VZ810",
    airline: "VietJet Air",
    airlineCode: "VZ",
    origin: "BKK",
    originCity: "Bangkok",
    destination: "SGN",
    destinationCity: "Ho Chi Minh City",
    aircraftType: "A321-200",
    registration: "HS-VKF",
    gate: "B3",
    sta: t(-37),
    ata: vz810_ata.toISOString(),
    std: t(28),
    etd: t(44),
    plannedGroundTime: 60,
    status: "delayed",
    sections: vz810_sections,
    currentBlocker: "FIDS system timeout — gate info delay affecting boarding start",
    hasAlert: true,
    alertCount: 1,
  };

  // ── PG213  BKK→CNX  Bangkok Airways  ATR72-600  AT RISK ──────────────────
  const pg213_ata = new Date(t(-57));
  const pg213_sections = buildSections(
    "pg213", pg213_ata,
    {
      pax: ["completed", "completed", "completed", "not_started", "not_started", "not_started", "not_started", "not_started"],
      ops: ["completed", "completed", "completed", "completed", "not_started", "not_started"],
      cgo: ["completed", "completed", "completed", "completed", "in_progress", "in_progress", "not_started"],
      mnt: ["completed", "completed", "completed", "in_progress", "not_started"],
      rmp: ["completed", "completed", "completed", "completed", "completed", "in_progress", "not_started", "not_started", "not_started", "not_started"],
    },
    { pax: [0, 0, 0, 8, 0, 0, 0, 0] },
    { pax: [undefined, undefined, undefined, "Gate open delayed — cleaning crew confirmation pending", undefined, undefined, undefined, undefined] },
  );

  const pg213: Flight = {
    id: "pg213",
    flightNumber: "PG213",
    airline: "Bangkok Airways",
    airlineCode: "PG",
    origin: "BKK",
    originCity: "Bangkok",
    destination: "CNX",
    destinationCity: "Chiang Mai",
    aircraftType: "ATR 72-600",
    registration: "HS-PGM",
    gate: "G1",
    sta: t(-62),
    ata: pg213_ata.toISOString(),
    std: t(13),
    etd: t(21),
    plannedGroundTime: 70,
    status: "at_risk",
    sections: pg213_sections,
    currentBlocker: "Gate open not issued — boarding start at risk",
    hasAlert: true,
    alertCount: 2,
  };

  // ── TG642  BKK→HKG  Thai Airways  B777-300ER  ON TIME ────────────────────
  const tg642_ata = new Date(t(-18));
  const tg642_sections = buildSections(
    "tg642", tg642_ata,
    {
      pax: ["completed", "in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started"],
      ops: ["completed", "not_started", "not_started", "not_started", "not_started", "not_started"],
      cgo: ["completed", "in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started"],
      mnt: ["in_progress", "not_started", "not_started", "not_started", "not_started"],
      rmp: ["completed", "completed", "in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started", "not_started"],
    },
  );

  const tg642: Flight = {
    id: "tg642",
    flightNumber: "TG642",
    airline: "Thai Airways",
    airlineCode: "TG",
    origin: "BKK",
    originCity: "Bangkok",
    destination: "HKG",
    destinationCity: "Hong Kong",
    aircraftType: "B777-300ER",
    registration: "HS-TKK",
    gate: "C5",
    sta: t(-23),
    ata: tg642_ata.toISOString(),
    std: t(92),
    etd: t(92),
    plannedGroundTime: 110,
    status: "on_time",
    sections: tg642_sections,
    hasAlert: false,
    alertCount: 0,
  };

  // ── NH847  HND→BKK  ANA  B787-9  ON TIME (just arrived) ──────────────────
  const nh847_ata = new Date(t(-8));
  const nh847_sections = buildSections(
    "nh847", nh847_ata,
    {
      pax: ["completed", "in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started"],
      ops: ["in_progress", "not_started", "not_started", "not_started", "not_started", "not_started"],
      cgo: ["in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started"],
      mnt: ["in_progress", "not_started", "not_started", "not_started", "not_started"],
      rmp: ["completed", "completed", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started", "not_started", "not_started"],
    },
  );

  const nh847: Flight = {
    id: "nh847",
    flightNumber: "NH847",
    airline: "All Nippon Airways",
    airlineCode: "NH",
    origin: "HND",
    originCity: "Tokyo Haneda",
    destination: "BKK",
    destinationCity: "Bangkok",
    aircraftType: "B787-9",
    registration: "JA831A",
    gate: "E3",
    sta: t(-13),
    ata: nh847_ata.toISOString(),
    std: t(88),
    etd: t(88),
    plannedGroundTime: 96,
    status: "on_time",
    sections: nh847_sections,
    hasAlert: false,
    alertCount: 0,
  };

  // ── AK892  BKK→KUL  AirAsia  A320-200  ON TIME ───────────────────────────
  const ak892_ata = new Date(t(-48));
  const ak892_sections = buildSections(
    "ak892", ak892_ata,
    {
      pax: ["completed", "completed", "completed", "not_started", "not_started", "not_started", "not_started", "not_started"],
      ops: ["completed", "completed", "completed", "in_progress", "not_started", "not_started"],
      cgo: ["completed", "completed", "completed", "in_progress", "not_started", "not_started", "not_started"],
      mnt: ["completed", "in_progress", "not_started", "not_started", "not_started"],
      rmp: ["completed", "completed", "completed", "completed", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started"],
    },
  );

  const ak892: Flight = {
    id: "ak892",
    flightNumber: "AK892",
    airline: "AirAsia",
    airlineCode: "AK",
    origin: "BKK",
    originCity: "Bangkok",
    destination: "KUL",
    destinationCity: "Kuala Lumpur",
    aircraftType: "A320-200",
    registration: "9M-AFX",
    gate: "A9",
    sta: t(-53),
    ata: ak892_ata.toISOString(),
    std: t(42),
    etd: t(42),
    plannedGroundTime: 90,
    status: "on_time",
    sections: ak892_sections,
    hasAlert: false,
    alertCount: 0,
  };

  // ── SQ720  SIN→BKK  Singapore Airlines  A380-800  COMPLETED ──────────────
  const sq720_ata = new Date(t(-128));
  const sq720_atd = t(-8);
  const sq720_sections = buildSections(
    "sq720", sq720_ata,
    {
      pax: ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed"],
      ops: ["completed", "completed", "completed", "completed", "completed", "completed"],
      cgo: ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
      mnt: ["completed", "completed", "completed", "completed", "completed"],
      rmp: ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed"],
    },
  );

  const sq720: Flight = {
    id: "sq720",
    flightNumber: "SQ720",
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    origin: "SIN",
    originCity: "Singapore",
    destination: "BKK",
    destinationCity: "Bangkok",
    aircraftType: "A380-800",
    registration: "9V-SKR",
    gate: "B2",
    sta: t(-133),
    ata: sq720_ata.toISOString(),
    std: t(-25),
    atd: sq720_atd,
    plannedGroundTime: 120,
    status: "completed",
    sections: sq720_sections,
    hasAlert: false,
    alertCount: 0,
  };

  // ── MH783  BKK→KUL  Malaysia Airlines  A330-300  ON TIME ─────────────────
  const mh783_ata = new Date(t(-30));
  const mh783_sections = buildSections(
    "mh783", mh783_ata,
    {
      pax: ["completed", "completed", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started"],
      ops: ["completed", "not_started", "not_started", "not_started", "not_started", "not_started"],
      cgo: ["completed", "in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started"],
      mnt: ["in_progress", "not_started", "not_started", "not_started", "not_started"],
      rmp: ["completed", "completed", "in_progress", "in_progress", "not_started", "not_started", "not_started", "not_started", "not_started", "not_started"],
    },
  );

  const mh783: Flight = {
    id: "mh783",
    flightNumber: "MH783",
    airline: "Malaysia Airlines",
    airlineCode: "MH",
    origin: "BKK",
    originCity: "Bangkok",
    destination: "KUL",
    destinationCity: "Kuala Lumpur",
    aircraftType: "A330-300",
    registration: "9M-MTG",
    gate: "B6",
    sta: t(-35),
    ata: mh783_ata.toISOString(),
    std: t(80),
    etd: t(80),
    plannedGroundTime: 110,
    status: "on_time",
    sections: mh783_sections,
    hasAlert: false,
    alertCount: 0,
  };

  // ── EK385  BKK→DXB  Emirates  B777-300ER  COMPLETED ──────────────────────
  const ek385_ata = new Date(t(-130));
  const ek385_atd = t(-15);
  const ek385_sections = buildSections(
    "ek385", ek385_ata,
    {
      pax: ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed"],
      ops: ["completed", "completed", "completed", "completed", "completed", "completed"],
      cgo: ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
      mnt: ["completed", "completed", "completed", "completed", "completed"],
      rmp: ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed"],
    },
  );

  const ek385: Flight = {
    id: "ek385",
    flightNumber: "EK385",
    airline: "Emirates",
    airlineCode: "EK",
    origin: "BKK",
    originCity: "Bangkok",
    destination: "DXB",
    destinationCity: "Dubai",
    aircraftType: "B777-300ER",
    registration: "A6-EGO",
    gate: "D1",
    sta: t(-135),
    ata: ek385_ata.toISOString(),
    std: t(-30),
    atd: ek385_atd,
    plannedGroundTime: 100,
    status: "completed",
    sections: ek385_sections,
    hasAlert: false,
    alertCount: 0,
  };

  return [tg409, nh850, fd352, sq979, vz810, pg213, tg642, nh847, ak892, sq720, mh783, ek385];
}

// ─── Memo ─────────────────────────────────────────────────────────────────────
let _flights: Flight[] | null = null;
export function getFlights(): Flight[] {
  if (!_flights) _flights = generateFlights();
  return _flights;
}

export function getFlightById(id: string): Flight | undefined {
  return getFlights().find((f) => f.id === id);
}

export function getAllTasks(): Task[] {
  return getFlights().flatMap((f) => f.sections.flatMap((s) => s.tasks));
}

export function getTaskById(id: string): Task | undefined {
  return getAllTasks().find((t) => t.id === id);
}

export function getSectionByType(flightId: string, section: SectionType): SectionData | undefined {
  return getFlightById(flightId)?.sections.find((s) => s.type === section);
}

// ─── ALERTS ───────────────────────────────────────────────────────────────────

export function generateAlerts(): Alert[] {
  return [
    {
      id: "al-001",
      severity: "critical",
      flightId: "tg409",
      flightNumber: "TG409",
      section: "cargo",
      task: "Weight & Balance Update",
      message: "W&B update not confirmed. Cargo load completed but load control has not signed off final weights. STD in 12 min. Boarding cannot proceed.",
      time: t(-8),
      suggestedAction: "Contact load control supervisor immediately to release W&B document. Escalate to Ramp Supervisor if no response in 2 min.",
    },
    {
      id: "al-002",
      severity: "warning",
      flightId: "tg409",
      flightNumber: "TG409",
      section: "passenger_service",
      task: "Passenger Boarding Start",
      message: "Boarding delayed 7 min. W&B not released by load control. 176 PAX waiting at gate C7.",
      time: t(-12),
      suggestedAction: "Issue gate announcement for 15-min delay. Pre-position priority boarding lane. Await W&B clearance.",
    },
    {
      id: "al-003",
      severity: "critical",
      flightId: "pg213",
      flightNumber: "PG213",
      section: "passenger_service",
      task: "Gate Open",
      message: "Gate G1 not yet opened. Boarding not started. STD in 13 min. 68 PAX at check-in area — gate not announced.",
      time: t(-5),
      suggestedAction: "Issue immediate gate open. Announce gate G1 via PA. Initiate fast-track boarding — all zones simultaneously.",
    },
    {
      id: "al-004",
      severity: "warning",
      flightId: "pg213",
      flightNumber: "PG213",
      section: "ramp",
      task: "Delay Reason Confirmation",
      message: "Delay code not confirmed with operations control. ACARS update required immediately for departure coordination.",
      time: t(-6),
      suggestedAction: "Ramp supervisor PG213 to confirm delay code DLA and notify ops control via ACARS and radio.",
    },
    {
      id: "al-005",
      severity: "warning",
      flightId: "sq979",
      flightNumber: "SQ979",
      section: "cargo",
      task: "Cargo Load",
      message: "Cargo load is 12 min behind schedule. Loader crew shortage at bay D4. Baggage load cannot begin until cargo positions are cleared.",
      time: t(-15),
      suggestedAction: "Assign additional cargo loader from standby pool. Contact ground handler shift supervisor for crew reallocation.",
    },
    {
      id: "al-006",
      severity: "warning",
      flightId: "vz810",
      flightNumber: "VZ810",
      section: "passenger_service",
      task: "FIDS Update",
      message: "FIDS update failed — DCS system timeout. Gate B3 not showing on departure displays. Passengers may not proceed to gate.",
      time: t(-18),
      suggestedAction: "Notify DCS support for system recovery. Issue manual PA announcement for gate B3. Post gate agent at entrance.",
    },
    {
      id: "al-007",
      severity: "warning",
      flightId: "fd352",
      flightNumber: "FD352",
      section: "cargo",
      task: "PAX Baggage Transfer",
      message: "Connecting baggage transfer delayed 6 min. Inbound flight arrived late. 12 bags need transfer to outbound A1 hold.",
      time: t(-20),
      suggestedAction: "Dispatch dedicated baggage cart for transfer. Confirm with gate agent if connecting PAX are on board before load.",
    },
  ];
}

let _alerts: Alert[] | null = null;
export function getAlerts(): Alert[] {
  if (!_alerts) _alerts = generateAlerts();
  return _alerts;
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────

export function generateReports(): Report[] {
  // TG409 — sample completed report (shows what report looks like post-departure)
  const tg409_report: Report = {
    id: "tg409",
    flightId: "tg409",
    flightNumber: "TG409",
    airline: "Thai Airways",
    route: "BKK → SIN",
    gate: "C7",
    aircraftType: "A320-200",
    registration: "HS-TXA",
    blockOnTime: t(-100),
    blockOffTime: t(15),
    totalGroundStay: 115,
    scheduledGroundStay: 100,
    variance: 15,
    departureDelay: 12,
    sections: [
      { section: "passenger_service", sectionName: "Passenger Service", plannedDuration: 90, actualDuration: 97, variance: 7,  delayMinutes: 7,  completedTasks: 8, totalTasks: 8 },
      { section: "flight_operations",  sectionName: "Flight Operations",  plannedDuration: 90, actualDuration: 90, variance: 0,  delayMinutes: 0,  completedTasks: 6, totalTasks: 6 },
      { section: "cargo",              sectionName: "Cargo",               plannedDuration: 78, actualDuration: 87, variance: 9,  delayMinutes: 9,  completedTasks: 7, totalTasks: 7 },
      { section: "maintenance",        sectionName: "Maintenance",         plannedDuration: 90, actualDuration: 90, variance: 0,  delayMinutes: 0,  completedTasks: 5, totalTasks: 5 },
      { section: "ramp",               sectionName: "Ramp Supervisor",     plannedDuration: 95, actualDuration: 107,variance: 12, delayMinutes: 12, completedTasks: 10,totalTasks: 10},
    ],
    primaryDelayCause: "Fueling start delayed 9 min — tanker repositioning from bay C4",
    primaryDelayMinutes: 8,
    secondaryDelayCause: "Cabin cleaning 5 min behind — crew size insufficient for wide-body",
    secondaryDelayMinutes: 5,
    otherDelayMinutes: -1,
    totalTasks: 36,
    completedOnTime: 22,
    completedLate: 7,
    notStarted: 7,
    averageDelayMinutes: 3.2,
    responsibility: { groundHandler: 42, catering: 17, fuelProvider: 25, other: 16 },
    operationalNotes: [
      "Fueling started at +9 min late — tanker repositioning from bay C4.",
      "Cleaning completed +5 min behind schedule — cabin crew size below standard.",
      "Boarding started +7 min late due to W&B confirmation delay.",
      "Pushback delayed — late boarding completion. Tug crew held at stand.",
    ],
    generatedBy: "Station Control System",
    generatedAt: t(20),
  };

  // SQ720 — on-time completed
  const sq720_report: Report = {
    id: "sq720",
    flightId: "sq720",
    flightNumber: "SQ720",
    airline: "Singapore Airlines",
    route: "SIN → BKK",
    gate: "B2",
    aircraftType: "A380-800",
    registration: "9V-SKR",
    blockOnTime: t(-128),
    blockOffTime: t(-8),
    totalGroundStay: 120,
    scheduledGroundStay: 120,
    variance: 0,
    departureDelay: 0,
    sections: [
      { section: "passenger_service", sectionName: "Passenger Service", plannedDuration: 110, actualDuration: 110, variance: 0, delayMinutes: 0, completedTasks: 8, totalTasks: 8 },
      { section: "flight_operations",  sectionName: "Flight Operations",  plannedDuration: 110, actualDuration: 108, variance: -2, delayMinutes: 0, completedTasks: 6, totalTasks: 6 },
      { section: "cargo",              sectionName: "Cargo",               plannedDuration: 100, actualDuration: 99, variance: -1, delayMinutes: 0, completedTasks: 7, totalTasks: 7 },
      { section: "maintenance",        sectionName: "Maintenance",         plannedDuration: 110, actualDuration: 108, variance: -2, delayMinutes: 0, completedTasks: 5, totalTasks: 5 },
      { section: "ramp",               sectionName: "Ramp Supervisor",     plannedDuration: 115, actualDuration: 114, variance: -1, delayMinutes: 0, completedTasks: 10,totalTasks: 10 },
    ],
    totalTasks: 36,
    completedOnTime: 33,
    completedLate: 3,
    notStarted: 0,
    averageDelayMinutes: 0.4,
    responsibility: { groundHandler: 0, catering: 0, fuelProvider: 0, other: 0 },
    operationalNotes: [
      "All critical path milestones completed within planned window.",
      "Boarding completed 3 min ahead of schedule.",
      "No technical defects raised by inbound crew.",
    ],
    generatedBy: "Station Control System",
    generatedAt: t(-5),
  };

  // EK385 — on-time completed
  const ek385_report: Report = {
    id: "ek385",
    flightId: "ek385",
    flightNumber: "EK385",
    airline: "Emirates",
    route: "BKK → DXB",
    gate: "D1",
    aircraftType: "B777-300ER",
    registration: "A6-EGO",
    blockOnTime: t(-130),
    blockOffTime: t(-15),
    totalGroundStay: 115,
    scheduledGroundStay: 100,
    variance: 15,
    departureDelay: 5,
    sections: [
      { section: "passenger_service", sectionName: "Passenger Service", plannedDuration: 90, actualDuration: 93, variance: 3,  delayMinutes: 3,  completedTasks: 8, totalTasks: 8 },
      { section: "flight_operations",  sectionName: "Flight Operations",  plannedDuration: 90, actualDuration: 90, variance: 0,  delayMinutes: 0,  completedTasks: 6, totalTasks: 6 },
      { section: "cargo",              sectionName: "Cargo",               plannedDuration: 80, actualDuration: 85, variance: 5,  delayMinutes: 5,  completedTasks: 7, totalTasks: 7 },
      { section: "maintenance",        sectionName: "Maintenance",         plannedDuration: 90, actualDuration: 92, variance: 2,  delayMinutes: 2,  completedTasks: 5, totalTasks: 5 },
      { section: "ramp",               sectionName: "Ramp Supervisor",     plannedDuration: 95, actualDuration: 100,variance: 5,  delayMinutes: 5,  completedTasks: 10,totalTasks: 10 },
    ],
    primaryDelayCause: "Catering truck delayed — vehicle breakdown en route to stand",
    primaryDelayMinutes: 5,
    otherDelayMinutes: 0,
    totalTasks: 36,
    completedOnTime: 28,
    completedLate: 8,
    notStarted: 0,
    averageDelayMinutes: 1.8,
    responsibility: { groundHandler: 20, catering: 55, fuelProvider: 10, other: 15 },
    operationalNotes: [
      "Catering truck breakdown caused 5 min delay to boarding start.",
      "Cargo load completed on schedule despite late catering.",
      "Crew completed pre-flight checks ahead of schedule — partially offset delay.",
    ],
    generatedBy: "Station Control System",
    generatedAt: t(-10),
  };

  return [tg409_report, sq720_report, ek385_report];
}

let _reports: Report[] | null = null;
export function getReports(): Report[] {
  if (!_reports) _reports = generateReports();
  return _reports;
}

export function getReportById(id: string): Report | undefined {
  return getReports().find((r) => r.id === id);
}

// ─── TIMELINE ACTIVITIES ──────────────────────────────────────────────────────

export function getTimelineActivities(flightId: string): TimelineActivity[] {
  const flight = getFlightById(flightId);
  if (!flight?.ata) return [];

  const ata = new Date(flight.ata).getTime();
  const std = new Date(flight.std).getTime();
  const gt  = Math.round((std - ata) / 60_000);

  return [
    {
      id: "deboard",  name: "Deboarding",
      section: "passenger_service",
      plannedStart: 0, plannedEnd: 18,
      actualStart: 0, actualEnd: flight.status === "completed" ? 18 : 18,
      isCriticalPath: false, delayMinutes: 0,
    },
    {
      id: "cleaning", name: "Cabin Cleaning",
      section: "passenger_service",
      plannedStart: 18, plannedEnd: 45,
      actualStart: 18, actualEnd: flight.status === "completed" ? 45 : undefined,
      isCriticalPath: true,
      delayMinutes: flight.id === "vz810" ? 16 : flight.id === "pg213" ? 8 : flight.id === "tg409" ? 5 : 0,
    },
    {
      id: "catering",  name: "Catering",
      section: "passenger_service",
      plannedStart: 20, plannedEnd: 50,
      actualStart: 22, actualEnd: flight.status === "completed" ? 52 : undefined,
      isCriticalPath: false, delayMinutes: 2,
    },
    {
      id: "fueling",  name: "Fueling",
      section: "ramp",
      plannedStart: 15, plannedEnd: 55,
      actualStart: flight.id === "tg409" ? 24 : 15,
      actualEnd: flight.status === "completed" ? 55 : flight.id === "tg409" ? 90 : undefined,
      isCriticalPath: true,
      delayMinutes: flight.id === "tg409" ? 9 : 0,
    },
    {
      id: "bag-unload", name: "Baggage Unload",
      section: "cargo",
      plannedStart: 5, plannedEnd: 25,
      actualStart: 5, actualEnd: 25,
      isCriticalPath: false, delayMinutes: 0,
    },
    {
      id: "cargo-load", name: "Cargo Load",
      section: "cargo",
      plannedStart: 40, plannedEnd: 65,
      actualStart: flight.id === "sq979" ? 52 : 40,
      actualEnd: flight.status === "completed" ? 65 : undefined,
      isCriticalPath: true,
      delayMinutes: flight.id === "sq979" ? 12 : 0,
    },
    {
      id: "boarding",  name: "Passenger Boarding",
      section: "passenger_service",
      plannedStart: gt - 42, plannedEnd: gt - 12,
      actualStart: flight.id === "pg213" ? undefined : flight.id === "tg409" ? gt - 35 : gt - 42,
      actualEnd: flight.status === "completed" ? gt - 12 : undefined,
      isCriticalPath: true,
      delayMinutes: flight.id === "tg409" ? 7 : flight.id === "pg213" ? 13 : 0,
    },
    {
      id: "door-close", name: "Door Close",
      section: "passenger_service",
      plannedStart: gt - 8, plannedEnd: gt - 5,
      actualStart: undefined, actualEnd: undefined,
      isCriticalPath: true, delayMinutes: 0,
    },
    {
      id: "pushback", name: "Pushback",
      section: "ramp",
      plannedStart: gt, plannedEnd: gt + 8,
      actualStart: undefined, actualEnd: undefined,
      isCriticalPath: true, delayMinutes: 0,
    },
  ];
}
