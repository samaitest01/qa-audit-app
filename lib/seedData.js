// Seed domains + checklist items — mirrors what was prototyped in the
// Claude artifact version. Used once by scripts/seed.js to populate a
// freshly created database.

const SEED_DOMAINS = [
  { id: "core", name: "Core QA Practices", description: "Universal QA process items applied to every project, regardless of domain.", builtin: true },
  { id: "webcloud", name: "Web & Cloud Applications", description: "Browser/cloud-hosted apps — manual and automation testing.", builtin: false },
  { id: "iot", name: "IoT", description: "Connected/embedded IoT products — device, connectivity, and OTA testing.", builtin: false },
  { id: "automotive", name: "Automotive Embedded", description: "Automotive embedded systems — HIL, real-time, and functional-safety testing.", builtin: false },
];

let counter = 0;
const mk = (domainId, category, question, weight, type) => ({
  id: `${domainId}-${(counter++).toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  domainId, category, question, weight, type,
});

const SEED_ITEMS = [
  // ---- Core (universal) ----
  mk("core", "QA Governance & Process", "A formal QA/Test Plan exists and is kept up to date.", 5, "Mandatory"),
  mk("core", "QA Governance & Process", "A clear and documented QA process (including entry/exit criteria) is established.", 3, "Mandatory"),
  mk("core", "QA Governance & Process", "Continuous feedback loop with stakeholders exists for QA improvement.", 5, "Mandatory"),
  mk("core", "QA Governance & Process", "Risk-based testing approach is used for prioritization.", 5, "Mandatory"),
  mk("core", "QA Governance & Process", "All QA team members receive proper onboarding and process training.", 3, "Mandatory"),
  mk("core", "Defect Management", "A defect tracking tool is consistently used.", 5, "Mandatory"),
  mk("core", "Defect Management", "Defects include clear summary and detailed description.", 5, "Mandatory"),
  mk("core", "Defect Management", "Defects are categorized by priority, severity, and type (QA/Prod).", 5, "Mandatory"),
  mk("core", "Defect Management", "Defect status follows a standard workflow and is updated regularly.", 5, "Mandatory"),
  mk("core", "Defect Management", "Critical defects are escalated immediately.", 5, "Mandatory"),
  mk("core", "Defect Management", "Defect leakage is measured and monitored.", 5, "Mandatory"),
  mk("core", "Tools, Reporting & Metrics", "A test management tool is used (Jira/TestRail/etc.).", 5, "Mandatory"),
  mk("core", "Tools, Reporting & Metrics", "Key QA metrics (coverage, execution, leakage) are tracked.", 5, "Mandatory"),
  mk("core", "Tools, Reporting & Metrics", "QA reports are shared with stakeholders before release.", 5, "Mandatory"),

  // ---- Web & Cloud Applications ----
  mk("webcloud", "Manual · QA Environment", "A dedicated QA environment exists and is stable for testing.", 4, "Optional"),
  mk("webcloud", "Manual · QA Environment", "UAT and Regression tests are executed only in QA/Staging, not in Production.", 3, "Optional"),
  mk("webcloud", "Manual · QA Environment", "Root Cause Analysis (RCA) is conducted for recurring defects or failures.", 3, "Optional"),
  mk("webcloud", "Manual · Test Management & Documentation", "Test cases are created for each User Story/Requirement.", 5, "Mandatory"),
  mk("webcloud", "Manual · Test Management & Documentation", "Test cases include Preconditions, Steps, and Expected Results.", 5, "Mandatory"),
  mk("webcloud", "Manual · Test Management & Documentation", "Test cases cover positive, negative, edge, and non-functional scenarios.", 5, "Optional"),
  mk("webcloud", "Manual · Test Management & Documentation", "Test cases are reviewed and approved before execution.", 5, "Optional"),
  mk("webcloud", "Manual · Test Management & Documentation", "End-to-end test scenarios are documented and maintained.", 5, "Mandatory"),
  mk("webcloud", "Manual · Test Management & Documentation", "Regression suites are reviewed and updated regularly.", 5, "Mandatory"),
  mk("webcloud", "Manual · Test Management & Documentation", "Obsolete or outdated test cases are archived periodically.", 3, "Optional"),
  mk("webcloud", "Manual · Test Management & Documentation", "Test estimations are provided for each sprint.", 5, "Optional"),
  mk("webcloud", "Manual · Test Execution & Coverage", "Formal Smoke & Sanity tests are executed in the QA environment.", 5, "Mandatory"),
  mk("webcloud", "Manual · Test Execution & Coverage", "Tests are executed across all required devices, OS versions, and browsers.", 3, "Optional"),
  mk("webcloud", "Manual · Test Execution & Coverage", "Test execution results are recorded, reviewed, and analyzed.", 5, "Mandatory"),
  mk("webcloud", "Manual · Test Execution & Coverage", "Failed test cases are mapped to a defect in the tracking tool.", 5, "Mandatory"),
  mk("webcloud", "Manual · Test Execution & Coverage", "End-to-end coverage is validated before release.", 5, "Mandatory"),
  mk("webcloud", "Manual · Test Execution & Coverage", "Non-functional testing is performed when required.", 3, "Optional"),
  mk("webcloud", "Automation · Documentation & Framework", "Automation requirements are documented and up-to-date.", 3, "Mandatory"),
  mk("webcloud", "Automation · Documentation & Framework", "Automation framework is defined and stable.", 5, "Mandatory"),
  mk("webcloud", "Automation · Documentation & Framework", "Framework supports modularity and reusability.", 5, "Mandatory"),
  mk("webcloud", "Automation · Code Quality", "Scripts follow coding standards and avoid duplication.", 5, "Mandatory"),
  mk("webcloud", "Automation · Test Data", "Test data is available, structured, and versioned.", 3, "Mandatory"),
  mk("webcloud", "Automation · Execution", "Test runs are stable and free of flaky tests.", 3, "Mandatory"),
  mk("webcloud", "Automation · CI/CD", "Automation is integrated into CI/CD pipeline with reports on failure.", 3, "Mandatory"),
  mk("webcloud", "Automation · Version Control", "Automation scripts are stored in version control with a defined branching strategy.", 2, "Mandatory"),
  mk("webcloud", "Automation · Reporting", "Test reports are clear, complete, and shared regularly with stakeholders.", 5, "Mandatory"),

  // ---- IoT ----
  mk("iot", "Device & Firmware Testing", "Firmware builds are tested on actual target hardware before release.", 5, "Mandatory"),
  mk("iot", "Device & Firmware Testing", "Device behavior is tested under low-battery and power-loss conditions.", 4, "Mandatory"),
  mk("iot", "Device & Firmware Testing", "Sensor/actuator readings are validated against expected physical ranges.", 4, "Mandatory"),
  mk("iot", "Connectivity & Protocols", "Connectivity is tested across all supported protocols (Wi-Fi, BLE, Zigbee, LoRa, etc.).", 5, "Mandatory"),
  mk("iot", "Connectivity & Protocols", "Device behavior under intermittent/lost connectivity is tested.", 5, "Mandatory"),
  mk("iot", "OTA & Lifecycle", "Over-the-air (OTA) update process is tested, including rollback on failure.", 5, "Mandatory"),
  mk("iot", "OTA & Lifecycle", "Device provisioning and decommissioning flows are tested.", 3, "Optional"),
  mk("iot", "OTA & Lifecycle", "Device-to-cloud data sync is validated for accuracy and latency.", 4, "Mandatory"),
  mk("iot", "Security", "Security testing covers device authentication and encrypted communication.", 5, "Mandatory"),
  mk("iot", "Security", "Interoperability with third-party hubs/ecosystems is tested where applicable.", 2, "Optional"),

  // ---- Automotive Embedded ----
  mk("automotive", "HIL & Bench Testing", "Test cases are executed on Hardware-in-the-Loop (HIL) or target ECU, not simulation only.", 5, "Mandatory"),
  mk("automotive", "HIL & Bench Testing", "Regression testing is run on a representative vehicle/bench configuration after each build.", 4, "Mandatory"),
  mk("automotive", "Real-Time & Safety", "Timing/real-time constraints (deadlines, jitter) are verified for critical tasks.", 5, "Mandatory"),
  mk("automotive", "Real-Time & Safety", "Boundary and fault-injection testing is performed for safety-critical functions.", 5, "Mandatory"),
  mk("automotive", "Bus & Diagnostics", "CAN/LIN/FlexRay bus communication is tested for correctness under load.", 4, "Mandatory"),
  mk("automotive", "Bus & Diagnostics", "Diagnostic trouble codes (DTCs) are validated against the diagnostic spec.", 3, "Mandatory"),
  mk("automotive", "Standards & Compliance", "Code complies with applicable coding standards (e.g. MISRA C) and is verified via static analysis.", 5, "Mandatory"),
  mk("automotive", "Standards & Compliance", "Traceability exists between requirements, test cases, and safety goals (e.g. ISO 26262 where applicable).", 4, "Mandatory"),
  mk("automotive", "Environmental & Calibration", "Environmental/stress testing (temperature, vibration) results are reviewed where applicable.", 3, "Optional"),
  mk("automotive", "Environmental & Calibration", "Calibration/parameter changes are tested for their effect on system behavior.", 3, "Optional"),
];

module.exports = { SEED_DOMAINS, SEED_ITEMS };
