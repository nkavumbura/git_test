# AGL Technician Task Assignment Tool — Project Plan

**Status:** Draft for review
**Date:** 30 October 2026
**Scope:** Plan only. No code has been written yet.

---

## 1. Purpose

Build a software tool that assigns Airfield Ground Lighting (AGL) maintenance tasks to technicians based on each person's verified competencies, availability and workload. Tasks are supplied in an Excel spreadsheet; the people and their competencies are supplied as a separate data set.

The tool must work for the current team of approximately **40 people** and scale without redesign to **100 or more**.

### 1.1 Guiding principles

1. **Safety first.** No-one is ever assigned to a task they are not currently competent and authorised to perform. This is a hard rule, not a preference.
2. **Decision support, not decision replacement.** The tool proposes a roster; a supervisor reviews, adjusts and approves it. Every manual override is recorded.
3. **Explainable.** For every assignment (and every task left unassigned) the tool can state *why*.
4. **Excel in, Excel out.** The team already works in Excel, so the first versions use Excel for both input and output. A web interface follows once the core logic is proven.
5. **Auditable.** Competency records and assignment history are retained so they can support audits and incident investigations.

---

## 2. Scope

### 2.1 In scope (initial releases)

- Importing and validating the task spreadsheet.
- Maintaining technician records, competencies, competency levels and expiry dates.
- Recording availability (shift pattern, leave, training, sickness).
- Automatically proposing task assignments that respect all hard constraints.
- Balancing workload fairly across the team.
- Producing output workbooks: roster by technician, roster by task, unassigned tasks with reasons, and a competency gap report.
- Supervisor override with a recorded reason.

### 2.2 Out of scope (initially; candidates for later phases)

- Direct integration with the airport CMMS / work order system (e.g. Maximo, SAP PM).
- Direct integration with the ALCMS / AGL control system.
- Mobile app for technicians.
- Automatic notification by e-mail / SMS / Teams.
- Payroll, overtime calculation or HR functions.

---

## 3. Domain model (what the tool needs to know)

The examples below are illustrative. The actual task types and competency framework must come from your organisation — see **Section 12, Open questions**.

### 3.1 Technicians

| Field | Example | Notes |
|---|---|---|
| Staff ID | T0412 | Unique key |
| Name | | |
| Role / grade | Technician, Senior Technician, Supervisor | |
| Team / shift group | Shift A, B, C, D or Day team | |
| Base location | | Optional — useful if the airfield is split into zones |
| Employment status | Active, on long-term leave, left | |

### 3.2 Competencies

A competency is a named skill or authorisation with an optional **level** and **expiry date**.

| Competency (example) | Levels | Expires? |
|---|---|---|
| Airside driving permit (manoeuvring area) | — | Yes |
| Electrical safety authorisation (e.g. Competent Person / Authorised Person for HV series circuits) | CP, AP, SAP | Yes |
| Constant Current Regulator (CCR) maintenance | 1 = assisted, 2 = independent, 3 = can supervise/train | Assessment-based |
| Series circuit fault-finding / insulation resistance testing | 1–3 | |
| Inset light fitting replacement / refurbishment | 1–3 | |
| PAPI alignment and flight-check support | 1–3 | |
| Stop bar / guidance sign maintenance | 1–3 | |
| ALCMS operation | 1–3 | |
| Photometric survey vehicle operation | 1–3 | |
| Confined space (AGL pits / manholes) | — | Yes |
| Working at height | — | Yes |
| First aid | — | Yes |

Each technician–competency record holds: level, date achieved, expiry date, assessor, and evidence reference.

### 3.3 Tasks (from the Excel input)

| Column | Example | Required? |
|---|---|---|
| Task ID / Work order no. | WO-2026-10341 | Yes |
| Description | Replace failed RCL fittings, RWY 09L, CH 1200–1500 | Yes |
| Task type | Inset fitting replacement | Yes |
| Location / zone | RWY 09L/27R | Recommended |
| Date | 03/11/2026 | Yes |
| Time window | 23:30–04:30 (runway closure) | Yes |
| Estimated duration (hours) | 4.0 | Yes |
| Priority | P1 (safety) … P4 (routine) | Yes |
| Crew size | 3 | Yes |
| Required competencies | Inset fitting L2; Airside driving; CP | Yes, or derived from task type |
| Supervision required | Yes — at least one person at L3 / AP | Optional |
| Preferred / excluded staff | | Optional |
| Notes | | Optional |

**Recommended approach:** maintain a **Task Type Library** that maps each task type to its required competencies and crew make-up. The Excel sheet then only needs the task type, and the tool looks up the requirements. This keeps the spreadsheet simple and the rules consistent. Per-task overrides remain possible.

### 3.4 Availability

- Shift roster (which shift group works which day/night).
- Planned leave, training courses, secondments.
- Unplanned absence (entered on the day).
- Maximum working hours per shift and minimum rest between shifts (fatigue management rules).

---

## 4. Assignment rules

### 4.1 Hard constraints — must never be broken

1. Every crew member holds every competency the task requires, at or above the required level.
2. All required competencies are **valid on the date of the task** (not expired).
3. The technician is rostered on and available for the full task time window.
4. A technician is not assigned to two overlapping tasks.
5. Crew size is met.
6. Crew composition rules are met — for example, at least one Authorised Person on any HV series circuit isolation; no lone working airside; at least one holder of a manoeuvring area driving permit per vehicle.
7. Working-time and fatigue limits are respected.

### 4.2 Soft constraints — optimised, in priority order (weights configurable)

1. Assign higher-priority tasks first; if not everything can be covered, leave the lowest-priority work unassigned.
2. Balance workload (hours) across technicians.
3. Keep skilled people available for scarce tasks (do not use the only PAPI-qualified technician on a lamp change if someone else can do it).
4. Development: pair a Level 1 technician with a Level 3 technician where the task allows, to build competency.
5. Continuity: keep the same crew on multi-day tasks.
6. Respect stated preferences and exclusions.
7. Minimise movement between airfield zones within a shift.

### 4.3 Explanation

For each task the tool records which constraints decided the outcome, for example:

> *WO-2026-10341 unassigned — needs 1 × Authorised Person (HV); 2 AP holders exist on Shift C: J. Smith on annual leave, A. Patel AP expired 14/10/2026.*

This is what turns the tool from a "black box" into something supervisors can trust.

---

## 5. Assignment engine — approach

The engine is built in two stages so that something useful is available quickly and the sophistication is added only where it pays for itself.

### Stage 1 — Eligibility matrix + rule-based allocation (MVP)

1. Build an **eligibility matrix**: for every task, the list of technicians who satisfy all hard constraints. This alone is valuable — it immediately shows tasks that nobody can do.
2. Sort tasks by priority, then by **scarcity** (fewest eligible people first).
3. For each task, choose the eligible technician(s) with the lowest current workload, honouring crew composition rules.
4. Report anything that could not be assigned, with reasons.

This is simple, fast, easy to explain and adequate for most days.

### Stage 2 — Optimisation solver

A greedy approach can paint itself into a corner (an early choice blocks a later task). Stage 2 formulates the problem as a constraint-satisfaction / optimisation model using **Google OR-Tools CP-SAT** (free, open-source, industry standard):

- Decision variable: `x[technician, task] ∈ {0,1}`
- Hard constraints from Section 4.1 as model constraints.
- Soft constraints from Section 4.2 as a weighted objective.
- Time limit (e.g. 10–30 seconds) with the best solution returned.

The Stage 1 output remains available as a fallback and as a benchmark.

### Scalability

The computational load is modest. For a weekly plan of, say, 300 tasks and 100 technicians the model has at most 30,000 binary variables before filtering, and the eligibility matrix typically removes most of them. CP-SAT solves problems of this size in seconds. Scaling from 40 to 100 people — or well beyond — is therefore **not an algorithmic problem**.

The real scaling challenges are organisational and are addressed in the design:

| Challenge at 100+ people | Design response |
|---|---|
| Multiple shifts, teams and supervisors | Team / shift group is a first-class attribute; plans can be generated per team or site-wide |
| More competency records to keep current | Expiry tracking, 30/60/90-day expiry warnings, bulk import |
| More concurrent users | Move from file-based to web application with a proper database (Phase 5) |
| Access control | Roles: Administrator, Supervisor, Viewer |
| Data volume and history | PostgreSQL; history retained and indexed |
| Performance testing | Synthetic data generator for 40, 100 and 500 technicians; automated benchmarks |

---

## 6. Recommended technology

| Layer | Choice | Reason |
|---|---|---|
| Language | Python 3.12+ | Excellent Excel and optimisation libraries; easy to maintain |
| Excel input/output | `openpyxl`, `pandas` | Read/write `.xlsx` with formatting and data validation |
| Data validation | `pydantic` | Clear, row-level error messages on import |
| Optimisation | Google OR-Tools (CP-SAT) | Free, fast, proven |
| Database | SQLite (Phases 1–4) → PostgreSQL (Phase 5+) | Zero setup initially; robust multi-user later |
| ORM / migrations | SQLAlchemy + Alembic | Same code works on SQLite and PostgreSQL |
| Web API (Phase 5) | FastAPI | Modern, well documented |
| Web UI (Phase 5) | To be agreed — see open questions | |
| Testing | `pytest` | Unit and scenario tests |
| Packaging / deployment | Docker container, or a Windows executable for a desktop pilot | Depends on IT policy |

---

## 7. Data model (logical)

```
Technician ──< TechnicianCompetency >── Competency
    │                                       │
    │                                       └──< TaskTypeRequirement >── TaskType
    │                                                                       │
    ├──< Availability (shift, leave, absence)                               │
    │                                                                       │
    └──< Assignment >── Task ───────────────────────────────────────────────┘
                          │
                          └── TaskRequirementOverride (optional)

AssignmentRun   — one record per planning run (inputs, settings, solver result)
AuditLog        — every create/update/override, who, when, why
```

---

## 8. Inputs and outputs

### 8.1 Input templates (supplied by the tool)

1. `tasks_template.xlsx` — one row per task; drop-down lists for task type, priority and zone; built-in validation.
2. `technicians_template.xlsx` — sheet *Technicians*, sheet *Competencies* (one row per technician per competency).
3. `availability_template.xlsx` — roster and leave.
4. `task_type_library.xlsx` — task type → required competencies and crew rules.

If you already have existing spreadsheets, the importer will be written to read **your** layout rather than forcing a new one. Please share samples (anonymised is fine).

### 8.2 Import validation

Before any assignment runs, the tool checks and reports, row by row:

- Missing mandatory fields, invalid dates or times.
- Unknown task types, competencies or staff IDs.
- Duplicate task IDs.
- Time windows that end before they start.
- Tasks for which **no-one** is eligible.

### 8.3 Output workbook

| Sheet | Content |
|---|---|
| Summary | Tasks received / assigned / unassigned; hours per technician; run settings |
| By Technician | Each person's tasks for the period, in time order — suitable for printing for a shift briefing |
| By Task | Each task and its crew, with the crew leader identified |
| Unassigned | Tasks not assigned and the specific reason |
| Competency Gaps | Competencies that limited assignment; people with expiries in the next 30/60/90 days |
| Workload | Hours per technician, highlighted against limits |

---

## 9. Delivery phases

Each phase ends with something you can run and review.

| Phase | Deliverable | Indicative effort |
|---|---|---|
| **0. Requirements and samples** | Answers to Section 12; sample (anonymised) task sheet and competency matrix; agreed task type library | 1 working session |
| **1. Project foundation and data import** | Repository structure, data model, Excel templates, importer with validation report, synthetic test data generator | 1–2 days |
| **2. Eligibility engine** | Eligibility matrix and "who can do what" report; competency expiry checks | 1 day |
| **3. Assignment engine — Stage 1** | Rule-based allocation; output workbook; command-line tool: `assign --tasks tasks.xlsx --out roster.xlsx` | 1–2 days |
| **4. Assignment engine — Stage 2** | CP-SAT optimiser; configurable weights; comparison with Stage 1; performance benchmarks at 40 / 100 / 500 staff | 2–3 days |
| **5. Web application** | Browser UI: upload tasks, review proposed roster, drag-and-drop override with reason, approve, export; user roles; PostgreSQL | 1–2 weeks |
| **6. Hardening and deployment** | Audit log, backups, security review, deployment per IT policy, user guide, supervisor training | 3–5 days |
| **7. Future options** | CMMS integration, notifications, mobile view, competency training planner | As required |

A pilot with real (anonymised) data on one shift is recommended at the end of Phase 3, before investing in the web application.

---

## 10. Testing strategy

- **Unit tests** for every rule (e.g. expired authorisation excludes a technician; overlapping tasks rejected).
- **Scenario tests** built from real situations, e.g. *"night runway closure, 4 tasks, only 2 APs on shift"*, with the expected result agreed by a supervisor.
- **Property checks** run against every generated roster: no hard constraint is ever violated. Any violation fails the run outright.
- **Scale tests** with synthetic teams of 40, 100 and 500 technicians and up to 1,000 tasks, with execution time recorded.
- **User acceptance**: supervisors compare tool output with their own manual roster for the same week.

---

## 11. Governance, safety and data protection

- The tool holds **personal data** (names, qualifications, absence). Storage location, retention and access must comply with your organisation's data protection policy.
- Absence reasons (e.g. sickness) should be stored only as "unavailable" unless there is a business need for more detail.
- Competency records should reference the authoritative source (training records system). The tool should not become a second, conflicting source of truth — see open questions.
- Approved rosters, overrides and the reasons for them are retained to support audits and investigations.
- Final responsibility for task allocation remains with the supervisor.

---

## 12. Open questions — answers needed before Phase 1

I have not made assumptions on these; please confirm or correct.

**Tasks and input**
1. Could you share a sample (anonymised) of the current task spreadsheet? What columns does it contain today?
2. Where do tasks originate — a CMMS export (which system?), or are they compiled manually?
3. What planning horizon is required: per shift, per day, per week, or longer?
4. Is a crew size specified per task, or is it currently decided by the supervisor?
5. Do tasks have fixed time windows (e.g. runway closures), or just a target date?

**People and competencies**
6. How is competency currently recorded — a competency matrix spreadsheet, a training system, or paper records?
7. Do competencies have levels (e.g. trainee / independent / supervisor), or are they simply held / not held?
8. Which competencies have expiry dates?
9. What crew composition rules apply (e.g. HV authorisation hierarchy, two-person rule airside, escort requirements)?
10. What is the shift pattern, and how is leave recorded today?

**Rules and priorities**
11. What should the tool do when not all tasks can be covered — leave low-priority tasks unassigned, or flag overtime / call-out options?
12. Is training / development pairing a requirement, or a nice-to-have?
13. Are there fatigue or working-time rules to enforce (maximum hours, minimum rest)?

**Users and deployment**
14. Who will use the tool — you only, supervisors, or technicians as well (read-only)?
15. Where must it run: a single PC, the corporate network, or cloud? Are there IT restrictions (e.g. no cloud hosting, approved software lists)?
16. Is integration with any existing system (CMMS, HR, training records) expected eventually?
17. Any preference for the eventual web UI, or should I recommend one?

---

## 13. Next steps

1. Review this plan and answer the open questions in Section 12.
2. Provide anonymised samples of the task spreadsheet and competency matrix.
3. Begin Phase 1 on agreement.
