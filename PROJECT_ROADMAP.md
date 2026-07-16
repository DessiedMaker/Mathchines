# Project Roadmap 2026: Mathchines

This document outlines the detailed **12-Week Project Roadmap** for **Mathchines** during the **Build with AI Internship Program 2026**. It aligns the product development milestones, beta testing strategy, market launch preparations, and weekly reporting workflows.

---

## 1. Roadmap Overview

The roadmap is structured into four sequential execution phases over a 12-week runway:

1. **Phase 1: MVP Hardening & Content Compilation (Weeks 1–4)**
   * Stabilize the client-side database, expand static curriculum coverage, and optimize the AI explanation engine.
2. **Phase 2: Beta Testing & Quality Validation (Weeks 5–8)**
   * Recruit testing cohorts, execute structured learning sessions, and compile feedback.
3. **Phase 3: Product Iteration & Market Prep (Weeks 9–12)**
   * Implement fixes, draft GTM strategies, refine pitch decks, and produce visual marketing assets.
4. **Phase 4: Ongoing Compliance (Daily & Weekly)**
   * Submit EOD deliverables reports and track hub support activities.

---

## 2. Master Execution Diagram

The diagram below integrates all execution phases, weekly objectives, deliverables, and dependencies into a single visual roadmap:

```mermaid
flowchart TD
    %% Styling Definitions
    classDef phase1 fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef phase2 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef phase3 fill:#fff8e1,stroke:#e65100,stroke-width:2px,color:#e65100;
    classDef ongoing fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c;

    subgraph P1["PHASE 1: MVP Core & Content (Weeks 1-4)"]
        direction TB
        W1["Week 1: Audit & Setup<br/>• Deliverable 1: Scope Review (Done)<br/>• Deliverable 2: Issues Log (In Progress)<br/>• Initiate Daily Logs"]:::phase1
        W2["Week 2: UX Hardening<br/>• Deliverable 2: Fix UI/UX Bugs<br/>• Offline Fallback Integrations"]:::phase1
        W3["Week 3: JHS Content<br/>• Deliverable 3: JHS 1-3 Lessons<br/>• WAEC/BECE Question Pools"]:::phase1
        W4["Week 4: SHS & AI Engine<br/>• Deliverable 3: SHS Lessons<br/>• Deliverable 4: AI Explanation Cache"]:::phase1
        W1 --> W2 --> W3 --> W4
    end

    subgraph P2["PHASE 2: Beta Validation (Weeks 5-8)"]
        direction TB
        W5["Week 5: Test Planning<br/>• Deliverable 5: MVP Supervisor Sign-Off<br/>• Deliverable 6: Draft Beta Test Plan"]:::phase2
        W6["Week 6: Recruitment<br/>• Deliverable 7: Onboard 10+ Students<br/>• Provide Mock Test Accounts"]:::phase2
        W7["Week 7: Practice Beta<br/>• Deliverable 8: Session 1 (Concept Learning)<br/>• Deliverable 9: Collect Telemetry & Forms"]:::phase2
        W8["Week 8: Exam Beta<br/>• Deliverable 8: Session 2 (Exam Mock)<br/>• Deliverable 10: Feedback Analysis Report"]:::phase2
        W5 --> W6 --> W7 --> W8
    end

    subgraph P3["PHASE 3: Market Prep & Launch (Weeks 9-12)"]
        direction TB
        W9["Week 9: Refinements<br/>• Deliverable 11: Priority Bug Fixes<br/>• Optimize Client Bundle (<3.5MB)"]:::phase3
        W10["Week 10: GTM Strategy<br/>• Deliverable 12: Write GTM Brief<br/>• Detail Billing/Zero-Rating Channels"]:::phase3
        W11["Week 11: Presentations<br/>• Deliverable 13: Refine Investor Pitch Deck"]:::phase3
        W12["Week 12: Production<br/>• Deliverable 14: Record 2-3m Demo Video<br/>• Compile Final Portfolio"]:::phase3
        W9 --> W10 --> W11 --> W12
    end

    subgraph PO["ONGOING DUTIES (Weeks 1-12)"]
        direction LR
        D15["Deliverable 15: Weekly Hub Support Log<br/>• Peer Mentoring & Hub Collaborations"]:::ongoing
        D16["Deliverable 16: Daily Progress Reports<br/>• Submit status to Supervisor"]:::ongoing
    end

    W4 --> W5
    W8 --> W9
```


---

## 4. Work Package Specifications

### Work Package A: MVP Completion (Weeks 1–5)
* **Objective:** Ensure the core learning loop works end-to-end under simulated network constraints.
* **Key Tasks:**
  * Clean up state transitions in the adaptive quiz selector.
  * Integrate offline-resilient error capturing to prevent the frontend crashing during API timeouts.
  * Write full answer explanations for all 40 static practice questions.

### Work Package B: Beta Validation (Weeks 5–8)
* **Objective:** Verify user engagement metrics, math scoring improvements, and offline database caching reliability.
* **Key Tasks:**
  * Draft test cases focusing on Ama (struggling student), Kofi (accelerator), and Kwame (low-connectivity).
  * Instrument local telemetry trackers in localStorage to record streaks, elapsed time, and difficulty progression.
  * Collate findings into a central CSV repository.

### Work Package C: Market Preparation (Weeks 9–12)
* **Objective:** Prepare Mathchines for scale and external communication with stakeholders.
* **Key Tasks:**
  * Polish UI transitions and clean unused imports to ensure fast page load speeds.
  * Structure slides in `PITCH_DECK.md` to be easily readable via markdown deck extensions.
  * Record high-definition screencasts demonstrating the local database syncing capabilities.
