# Ameriprise Financial — IAM Policy Corpus v1.0
## Classification: INTERNAL USE — Identity & Access Management
### Effective Date: 2026-06-01
### Owner: Chief Information Security Officer (CISO) / Identity Governance Team
### Review Cycle: Quarterly

---

## Table of Contents
1. [Organization Structure & Identity Boundaries](#1-organization-structure--identity-boundaries)
2. [Role Definitions & Entitlements](#2-role-definitions--entitlements)
3. [Permission Catalog](#3-permission-catalog)
4. [Segregation of Duties (SoD) Matrix](#4-segregation-of-duties-sod-matrix)
5. [Approval Workflows & Escalation Paths](#5-approval-workflows--escalation-paths)
6. [Client Data Access Rules](#6-client-data-access-rules)
7. [Third-Party & Vendor Access Rules](#7-third-party--vendor-access-rules)
8. [Non-Human Identity (NHI) Governance](#8-non-human-identity-nhi-governance)
9. [Exception Management](#9-exception-management)
10. [Audit & Compliance Requirements](#10-audit--compliance-requirements)

---

## 1. Organization Structure & Identity Boundaries

### 1.1 Business Units
| Unit ID | Business Unit | Identity Domain | Primary Systems |
|---------|--------------|-----------------|-----------------|
| BU-001 | Wealth Management — Branch Network | BRANCH | Advisor Portal, CRM, Portfolio Mgmt |
| BU-002 | Asset Management | CORPORATE | Bloomberg, Aladdin, Internal Research |
| BU-003 | Insurance & Annuities | CORPORATE | Policy Admin, Illustration Systems |
| BU-004 | Corporate & Shared Services | CORPORATE | ERP, HRIS, Finance, Legal |
| BU-005 | Technology & Operations | CORPORATE | DevOps, Cloud, IAM Admin Consoles |

### 1.2 Identity Types
| Type | Description | Lifecycle Owner | Review Frequency |
|------|-------------|-----------------|------------------|
| EMP-FT | Full-Time Employee | HR | Quarterly |
| EMP-PT | Part-Time Employee | HR | Quarterly |
| ADV-IND | Independent Franchise Advisor | Branch Ops | Monthly |
| ADV-EMP | Employee Advisor | Branch Ops | Quarterly |
| CONT | Contractor / Consultant | Procurement | Monthly |
| VENDOR | Third-Party Service Account | Vendor Mgmt | Monthly |
| SERVICE | Internal Service Account / API Key | Engineering | Weekly |
| CLIENT | End-Customer Digital Identity | Digital | Per Event |

### 1.3 Access Zones
| Zone | Description | MFA Required | VPN Required | Just-In-Time (JIT) |
|------|-------------|--------------|--------------|-------------------|
| ZONE-PUBLIC | Public website, marketing | No | No | No |
| ZONE-ADVISOR | Advisor portal, client data (read-only) | Yes | No | No |
| ZONE-CONFIDENTIAL | Client PII, portfolio data, trade execution | Yes | Yes | No |
| ZONE-RESTRICTED | Core banking, settlement, audit systems | Yes | Yes | Yes (4hr max) |
| ZONE-DEV | Development & staging environments | Yes | Yes | Yes (8hr max) |

---

## 2. Role Definitions & Entitlements

### 2.1 Branch Network — Advisor Roles

#### ROLE-ADV-001: Junior Financial Advisor (JFA)
- **Identity Type:** EMP-FT or ADV-EMP
- **Business Unit:** BU-001
- **Access Zone:** ZONE-ADVISOR, ZONE-CONFIDENTIAL (read-only)
- **Permissions:**
  - CLIENT_CONTACT_READ
  - PORTFOLIO_READ
  - REPORT_GENERATE
  - APPOINTMENT_SCHEDULE
  - CLIENT_NOTE_CREATE
- **Scope:** Assigned clients only (max 150 active clients)
- **Constraints:**
  - Cannot initiate trades (requires ROLE-ADV-002 or higher)
  - Cannot export client data bulk (requires MANAGER_APPROVAL)
  - Cannot access clients outside assigned branch
- **MFA:** Required for all sessions
- **Session Timeout:** 4 hours

#### ROLE-ADV-002: Senior Wealth Advisor (SWA)
- **Identity Type:** EMP-FT, ADV-EMP, or ADV-IND
- **Business Unit:** BU-001
- **Access Zone:** ZONE-ADVISOR, ZONE-CONFIDENTIAL
- **Permissions:**
  - All ROLE-ADV-001 permissions
  - TRADE_INITIATE
  - CLIENT_DATA_EXPORT (limited, ≤50 records/session)
  - PORTFOLIO_REBALANCE_RECOMMEND
  - FINANCIAL_PLAN_CREATE
- **Scope:** All clients within assigned branch territory
- **Constraints:**
  - Cannot approve own trades (enforced by SoD-003)
  - Cannot modify client KYC records (requires ROLE-OPS-002)
  - Cannot access settlement systems (requires ROLE-OPS-003)
- **MFA:** Required + hardware token for TRADE_INITIATE
- **Session Timeout:** 8 hours

#### ROLE-ADV-003: Branch Manager / Complex Director (BMCD)
- **Identity Type:** EMP-FT
- **Business Unit:** BU-001
- **Access Zone:** ZONE-ADVISOR, ZONE-CONFIDENTIAL, ZONE-RESTRICTED (limited)
- **Permissions:**
  - All ROLE-ADV-002 permissions
  - ADVISOR_PERFORMANCE_REVIEW
  - BRANCH_REPORTING_FULL
  - TRADE_APPROVE (for advisors under their supervision)
  - ACCESS_REQUEST_APPROVE (Level 2 for branch staff)
  - CLIENT_REASSIGN
- **Scope:** All clients and advisors within branch/complex
- **Constraints:**
  - Cannot approve their own trades (SoD-003)
  - Cannot approve access requests for themselves (SoD-005)
  - Cannot access corporate finance systems (requires ROLE-CORP-001)
- **MFA:** Required + hardware token
- **Session Timeout:** 8 hours
- **Special:** Requires annual FINRA Series 24 or equivalent

#### ROLE-ADV-004: Private Wealth Advisor (PWA)
- **Identity Type:** EMP-FT or ADV-IND
- **Business Unit:** BU-001
- **Access Zone:** ZONE-ADVISOR, ZONE-CONFIDENTIAL, ZONE-RESTRICTED (limited)
- **Permissions:**
  - All ROLE-ADV-003 permissions except TRADE_APPROVE
  - HNW_CLIENT_ONBOARD
  - ALTERNATIVE_INVESTMENT_ACCESS
  - TAX_LOSS_HARVESTING_INITIATE
  - ESTATE_PLANNING_READ
- **Scope:** HNW/UHNW clients only (min $1M AUM per relationship)
- **Constraints:**
  - Cannot approve trades for other advisors
  - Cannot access branch-level aggregate reporting for other branches
- **MFA:** Required + hardware token + biometric for mobile
- **Session Timeout:** 8 hours

### 2.2 Branch Operations & Support Roles

#### ROLE-OPS-001: Branch Operations Specialist (BOS)
- **Identity Type:** EMP-FT or EMP-PT
- **Business Unit:** BU-001
- **Access Zone:** ZONE-ADVISOR, ZONE-CONFIDENTIAL
- **Permissions:**
  - CLIENT_CONTACT_READ
  - CLIENT_ONBOARD_INITIATE
  - DOCUMENT_UPLOAD
  - APPOINTMENT_SCHEDULE
  - CLIENT_NOTE_CREATE
- **Scope:** Assigned branch only
- **Constraints:**
  - Cannot view portfolio values or performance (SoD-007)
  - Cannot initiate trades
  - Cannot export client lists
- **MFA:** Required
- **Session Timeout:** 4 hours

#### ROLE-OPS-002: Client Service Associate (CSA)
- **Identity Type:** EMP-FT or EMP-PT
- **Business Unit:** BU-001
- **Access Zone:** ZONE-ADVISOR, ZONE-CONFIDENTIAL
- **Permissions:**
  - All ROLE-OPS-001 permissions
  - KYC_VERIFY
  - CLIENT_DATA_UPDATE (contact info, address, beneficiary changes)
  - DOCUMENT_RETRIEVE
- **Scope:** Assigned branch only
- **Constraints:**
  - Cannot initiate trades (SoD-002)
  - Cannot approve KYC changes they initiated (SoD-002)
  - Cannot access portfolio management tools
- **MFA:** Required
- **Session Timeout:** 4 hours

#### ROLE-OPS-003: Operations Manager (OM)
- **Identity Type:** EMP-FT
- **Business Unit:** BU-001
- **Access Zone:** ZONE-ADVISOR, ZONE-CONFIDENTIAL, ZONE-RESTRICTED (limited)
- **Permissions:**
  - TRADE_EXECUTE (back-office execution)
  - SETTLEMENT_RECONCILE
  - CLIENT_ACCOUNT_MAINTAIN
  - FEE_BILLING_INITIATE
  - ACCESS_REQUEST_APPROVE (Level 2 for ops staff)
- **Scope:** Assigned branch/complex
- **Constraints:**
  - Cannot initiate front-office trades (SoD-004)
  - Cannot approve their own access requests (SoD-005)
  - Cannot access client financial planning data
- **MFA:** Required + hardware token
- **Session Timeout:** 8 hours

### 2.3 Corporate Roles

#### ROLE-CORP-001: Financial Analyst (FA)
- **Identity Type:** EMP-FT
- **Business Unit:** BU-002, BU-003, BU-004
- **Access Zone:** ZONE-CONFIDENTIAL (corporate systems)
- **Permissions:**
  - FINANCIAL_DATA_READ
  - REPORT_GENERATE
  - MARKET_DATA_READ
  - RESEARCH_READ
- **Scope:** Assigned fund/product line
- **Constraints:**
  - Cannot modify source data (SoD-008)
  - Cannot approve journal entries (requires ROLE-CORP-003)
- **MFA:** Required
- **Session Timeout:** 8 hours

#### ROLE-CORP-002: Compliance Officer (CO)
- **Identity Type:** EMP-FT
- **Business Unit:** BU-004
- **Access Zone:** ZONE-ADVISOR, ZONE-CONFIDENTIAL, ZONE-RESTRICTED (read-only)
- **Permissions:**
  - AUDIT_LOG_READ
  - BRANCH_REPORTING_FULL (read-only)
  - CLIENT_DATA_READ (read-only, surveillance)
  - TRADE_SURVEILLANCE_READ
  - POLICY_EXCEPTION_APPROVE (Level 3)
  - ACCESS_REQUEST_APPROVE (Level 3)
- **Scope:** Enterprise-wide (read-only surveillance)
- **Constraints:**
  - Cannot execute trades (SoD-006)
  - Cannot modify client data
  - Cannot approve their own access requests (SoD-005)
- **MFA:** Required + hardware token
- **Session Timeout:** 8 hours
- **Special:** Requires annual FINRA Series 7 + 66 or equivalent

#### ROLE-CORP-003: Accounting / Finance Controller (FC)
- **Identity Type:** EMP-FT
- **Business Unit:** BU-004
- **Access Zone:** ZONE-CONFIDENTIAL, ZONE-RESTRICTED
- **Permissions:**
  - GENERAL_LEDGER_POST
  - JOURNAL_ENTRY_CREATE
  - JOURNAL_ENTRY_APPROVE
  - FINANCIAL_REPORT_CERTIFY
  - FEE_BILLING_APPROVE
- **Scope:** Enterprise-wide
- **Constraints:**
  - Cannot create AND approve the same journal entry (SoD-001 variant)
  - Cannot access client portfolio management systems (SoD-009)
- **MFA:** Required + hardware token
- **Session Timeout:** 4 hours
- **Special:** SOX-critical role; quarterly access recertification mandatory

#### ROLE-CORP-004: IAM Administrator (IAM-ADM)
- **Identity Type:** EMP-FT
- **Business Unit:** BU-005
- **Access Zone:** ZONE-DEV, ZONE-RESTRICTED (IAM systems only)
- **Permissions:**
  - IDENTITY_PROVISION
  - IDENTITY_DEACTIVATE
  - ROLE_MODIFY
  - POLICY_MODIFY
  - AUDIT_LOG_READ
- **Scope:** Enterprise-wide (IAM systems only)
- **Constraints:**
  - Cannot modify their own roles or permissions (SoD-005)
  - Cannot access production client data (SoD-010)
  - All actions logged and reviewed by ROLE-CORP-002
- **MFA:** Required + hardware token + PAM session recording
- **Session Timeout:** 4 hours (JIT elevation)
- **Special:** Privileged Access Management (PAM) required; all sessions recorded

#### ROLE-CORP-005: Software Engineer (SWE)
- **Identity Type:** EMP-FT or CONT
- **Business Unit:** BU-005
- **Access Zone:** ZONE-DEV
- **Permissions:**
  - CODE_REPOSITORY_READ_WRITE
  - CI_CD_TRIGGER
  - DEV_ENVIRONMENT_ADMIN
- **Scope:** Assigned product squad
- **Constraints:**
  - Cannot access production databases (SoD-010)
  - Cannot modify IAM policies (requires ROLE-CORP-004)
  - Cannot access client PII in non-prod without masking
- **MFA:** Required
- **Session Timeout:** 8 hours
- **Special:** Contractors require manager-attested access renewal every 30 days

### 2.4 Vendor & Service Roles

#### ROLE-VENDOR-001: Custodial Data Feed (API)
- **Identity Type:** VENDOR
- **Business Unit:** BU-001 (integrated)
- **Access Zone:** ZONE-RESTRICTED (API gateway only)
- **Permissions:**
  - PORTFOLIO_READ (batch)
  - TRADE_CONFIRMATION_WRITE
  - SETTLEMENT_STATUS_WRITE
- **Scope:** Designated account range only
- **Constraints:**
  - Read-only on portfolio data; no write access to client records
  - API key scoped to IP whitelist
  - Token TTL: 1 hour
- **MFA:** N/A (mTLS + IP whitelist)
- **Session Timeout:** 1 hour (token-based)

#### ROLE-VENDOR-002: Marketing Platform (SaaS)
- **Identity Type:** VENDOR
- **Business Unit:** BU-004 (Marketing)
- **Access Zone:** ZONE-PUBLIC, ZONE-ADVISOR (limited)
- **Permissions:**
  - CLIENT_CONTACT_READ (masked: name + email only, no SSN, no account numbers)
  - CAMPAIGN_TRIGGER
  - ENGAGEMENT_METRIC_READ
- **Scope:** Marketing-segmented lists only
- **Constraints:**
  - No access to financial data, portfolio data, or KYC documents
  - Data export blocked; API-only access
  - Annual security assessment required
- **MFA:** N/A (OAuth 2.0 + scoped scopes)
- **Session Timeout:** 24 hours (refresh token)

---

## 3. Permission Catalog

| Permission ID | Description | Risk Level | Zone | Requires Approval |
|---------------|-------------|------------|------|-------------------|
| CLIENT_CONTACT_READ | View client contact information (name, address, phone) | LOW | ZONE-ADVISOR | Auto (role-based) |
| PORTFOLIO_READ | View portfolio holdings, performance, allocation | MEDIUM | ZONE-CONFIDENTIAL | Auto (role-based) |
| PORTFOLIO_READ_WRITE | Modify portfolio models, rebalance | HIGH | ZONE-CONFIDENTIAL | Manager + Compliance |
| TRADE_INITIATE | Place buy/sell orders for clients | HIGH | ZONE-CONFIDENTIAL | Manager (Level 2) |
| TRADE_EXECUTE | Execute back-office trade settlements | CRITICAL | ZONE-RESTRICTED | Ops Manager (Level 2) |
| TRADE_APPROVE | Approve trades initiated by others | CRITICAL | ZONE-RESTRICTED | Branch Manager (Level 2) |
| CLIENT_DATA_EXPORT | Export client data to file/email | HIGH | ZONE-CONFIDENTIAL | Manager + DLP scan |
| CLIENT_DATA_UPDATE | Update client contact/beneficiary info | MEDIUM | ZONE-CONFIDENTIAL | Auto (role-based) |
| CLIENT_ONBOARD_INITIATE | Begin new client onboarding workflow | MEDIUM | ZONE-ADVISOR | Auto (role-based) |
| KYC_VERIFY | Verify identity documents, approve KYC | HIGH | ZONE-CONFIDENTIAL | Compliance (Level 3) |
| HNW_CLIENT_ONBOARD | Onboard high-net-worth clients (≥$1M) | HIGH | ZONE-RESTRICTED | Branch Manager + Compliance |
| SETTLEMENT_RECONCILE | Reconcile trade settlements | CRITICAL | ZONE-RESTRICTED | Ops Manager (Level 2) |
| FEE_BILLING_INITIATE | Generate client fee invoices | HIGH | ZONE-RESTRICTED | Auto (role-based) |
| FEE_BILLING_APPROVE | Approve fee calculations and billing | CRITICAL | ZONE-RESTRICTED | Finance Controller (Level 3) |
| REPORT_GENERATE | Generate standard/client reports | LOW | ZONE-ADVISOR | Auto (role-based) |
| BRANCH_REPORTING_FULL | Access all branch-level reports and metrics | MEDIUM | ZONE-CONFIDENTIAL | Auto (role-based) |
| ADVISOR_PERFORMANCE_REVIEW | View advisor production metrics | MEDIUM | ZONE-CONFIDENTIAL | Auto (role-based) |
| CLIENT_REASSIGN | Transfer client relationship to another advisor | HIGH | ZONE-CONFIDENTIAL | Branch Manager + Client Consent |
| FINANCIAL_PLAN_CREATE | Create/modify client financial plans | MEDIUM | ZONE-CONFIDENTIAL | Auto (role-based) |
| ESTATE_PLANNING_READ | Access estate planning documents | HIGH | ZONE-RESTRICTED | Private Wealth Director |
| ALTERNATIVE_INVESTMENT_ACCESS | Access alt-investment platforms | HIGH | ZONE-RESTRICTED | Compliance + Product Approval |
| TAX_LOSS_HARVESTING_INITIATE | Initiate TLH strategies | HIGH | ZONE-CONFIDENTIAL | Senior Advisor + Tax Review |
| DOCUMENT_UPLOAD | Upload client documents to DMS | LOW | ZONE-ADVISOR | Auto (role-based) |
| DOCUMENT_RETRIEVE | Retrieve client documents from DMS | LOW | ZONE-ADVISOR | Auto (role-based) |
| APPOINTMENT_SCHEDULE | Schedule client meetings | LOW | ZONE-ADVISOR | Auto (role-based) |
| CLIENT_NOTE_CREATE | Add notes to client CRM record | LOW | ZONE-ADVISOR | Auto (role-based) |
| GENERAL_LEDGER_POST | Post entries to general ledger | CRITICAL | ZONE-RESTRICTED | Finance Controller (Level 3) |
| JOURNAL_ENTRY_CREATE | Create accounting journal entries | CRITICAL | ZONE-RESTRICTED | Auto (role-based) |
| JOURNAL_ENTRY_APPROVE | Approve journal entries | CRITICAL | ZONE-RESTRICTED | Finance Controller (Level 3) |
| FINANCIAL_REPORT_CERTIFY | Certify financial reports for SEC/SOX | CRITICAL | ZONE-RESTRICTED | CFO / Designee (Level 4) |
| AUDIT_LOG_READ | Read system audit logs | MEDIUM | ZONE-RESTRICTED | Compliance (Level 3) |
| IDENTITY_PROVISION | Create/modify user accounts | CRITICAL | ZONE-RESTRICTED | IAM Manager (Level 3) |
| IDENTITY_DEACTIVATE | Disable/terminate user accounts | CRITICAL | ZONE-RESTRICTED | IAM Manager (Level 3) |
| ROLE_MODIFY | Modify role definitions | CRITICAL | ZONE-RESTRICTED | IAM Manager + CISO (Level 4) |
| POLICY_MODIFY | Modify IAM policies | CRITICAL | ZONE-RESTRICTED | CISO (Level 4) |
| CODE_REPOSITORY_READ_WRITE | Read/write source code | MEDIUM | ZONE-DEV | Auto (role-based) |
| CI_CD_TRIGGER | Trigger deployment pipelines | HIGH | ZONE-DEV | Engineering Manager (Level 2) |
| DEV_ENVIRONMENT_ADMIN | Admin rights in dev/staging | MEDIUM | ZONE-DEV | Auto (role-based) |
| MARKET_DATA_READ | Access market data feeds | LOW | ZONE-CONFIDENTIAL | Auto (role-based) |
| RESEARCH_READ | Access internal research reports | MEDIUM | ZONE-CONFIDENTIAL | Auto (role-based) |
| FINANCIAL_DATA_READ | Read financial/performance data | MEDIUM | ZONE-CONFIDENTIAL | Auto (role-based) |
| TRADE_SURVEILLANCE_READ | Read trade surveillance alerts | MEDIUM | ZONE-RESTRICTED | Compliance (Level 3) |
| POLICY_EXCEPTION_APPROVE | Approve IAM policy exceptions | CRITICAL | ZONE-RESTRICTED | CISO (Level 4) |
| ACCESS_REQUEST_APPROVE | Approve access requests (varies by level) | HIGH | Varies | Level-dependent |
| CAMPAIGN_TRIGGER | Trigger marketing campaigns | LOW | ZONE-PUBLIC | Marketing Manager (Level 2) |
| ENGAGEMENT_METRIC_READ | Read campaign engagement data | LOW | ZONE-PUBLIC | Auto (role-based) |

---

## 4. Segregation of Duties (SoD) Matrix

### 4.1 Critical SoD Rules (Hard Deny — No Exceptions Without CISO)

| Rule ID | Role/Permission A | Role/Permission B | Conflict Type | Severity | Exception Process |
|---------|-------------------|-------------------|---------------|----------|-------------------|
| SoD-001 | TRADE_EXECUTE | TRADE_APPROVE | Same person cannot execute and approve trades | CRITICAL | CRO sign-off + dual-control + 90-day expiry |
| SoD-002 | CLIENT_ONBOARD_INITIATE | KYC_VERIFY | Same person cannot onboard and verify KYC | HIGH | None permitted |
| SoD-003 | TRADE_INITIATE (as advisor) | TRADE_APPROVE (as manager) | Advisor cannot approve their own trades | CRITICAL | None permitted |
| SoD-004 | TRADE_INITIATE (front-office) | TRADE_EXECUTE (back-office) | Front-office cannot execute back-office settlements | HIGH | None permitted |
| SoD-005 | ACCESS_REQUEST_APPROVE | Any role requesting access for self | Cannot approve your own access request | CRITICAL | None permitted |
| SoD-006 | TRADE_SURVEILLANCE_READ | TRADE_INITIATE / TRADE_EXECUTE | Compliance cannot surveil and trade | HIGH | None permitted |
| SoD-007 | PORTFOLIO_READ / PORTFOLIO_READ_WRITE | CLIENT_ONBOARD_INITIATE (for ops) | Ops specialists cannot view portfolio values and onboard | MEDIUM | Branch Manager sign-off |
| SoD-008 | FINANCIAL_DATA_READ | GENERAL_LEDGER_POST | Analysts cannot read and post to GL | HIGH | None permitted |
| SoD-009 | PORTFOLIO_READ_WRITE | GENERAL_LEDGER_POST / JOURNAL_ENTRY_APPROVE | Portfolio managers cannot post to accounting | HIGH | None permitted |
| SoD-010 | IDENTITY_PROVISION / ROLE_MODIFY | Any client data access | IAM admins cannot access client data | CRITICAL | None permitted |
| SoD-011 | CODE_REPOSITORY_READ_WRITE | PRODUCTION_DATABASE_WRITE | Engineers cannot write code and prod DB | CRITICAL | None permitted |
| SoD-012 | JOURNAL_ENTRY_CREATE | JOURNAL_ENTRY_APPROVE | Same person cannot create and approve JE | CRITICAL | CFO sign-off + 90-day expiry |

### 4.2 SoD Detection Logic
```
IF (User has Permission A AND Permission B in same session OR same role assignment)
  AND (Rule ID is CRITICAL)
THEN DENY + Log + Alert Compliance + Require Manager Action

IF (User has Permission A AND Permission B)
  AND (Rule ID is HIGH)
THEN DENY + Log + Alert Manager + Require Exception Request

IF (User has Permission A AND Permission B)
  AND (Rule ID is MEDIUM)
THEN WARN + Log + Require Manager Acknowledgment
```

---

## 5. Approval Workflows & Escalation Paths

### 5.1 Access Request Levels

| Level | Request Type | Approver 1 | Approver 2 | Approver 3 | SLA |
|-------|-------------|------------|------------|------------|-----|
| Level 1 | Standard role assignment (auto-approved roles) | Auto-approve | — | — | Instant |
| Level 2 | Elevated permissions, manager-dependent roles | Direct Manager | — | — | 24 hours |
| Level 3 | High-risk permissions, cross-zone access | Direct Manager | Compliance Officer | — | 48 hours |
| Level 4 | Critical permissions, policy exceptions, SoD overrides | Direct Manager | CISO / Designee | Compliance Officer | 72 hours |

### 5.2 Workflow Steps

#### WORKFLOW-001: Standard Access Request (Level 1)
1. User submits request via PolicyPilot
2. AI pre-checks against SoD matrix and role eligibility
3. If clean → Auto-approve → Provision → Notify user
4. If conflict → Escalate to Level 2

#### WORKFLOW-002: Elevated Access Request (Level 2)
1. User submits request with business justification
2. AI pre-checks SoD + role compatibility
3. Route to Direct Manager for approval
4. Manager approves → Provision → Log
5. Manager denies → Notify user with reason
6. No action in 24h → Escalate to Level 3

#### WORKFLOW-003: High-Risk Access Request (Level 3)
1. User submits request with detailed justification + risk mitigation plan
2. AI pre-checks + generates risk narrative
3. Route to Direct Manager + Compliance Officer (parallel)
4. Both approve → Provision → Quarterly review scheduled
5. Either denies → Notify user + log exception
6. No action in 48h → Escalate to Level 4

#### WORKFLOW-004: Critical / SoD Exception Request (Level 4)
1. User submits request with business case + compensating controls
2. AI flags as SoD exception → Generates exception report
3. Route to Direct Manager + CISO + Compliance Officer (sequential)
4. All approve → Time-bound provision (max 90 days) → Mandatory quarterly review
5. Any denial → Full stop + log + audit trail
6. No action in 72h → Auto-deny + alert CISO

---

## 6. Client Data Access Rules

### 6.1 Data Classification
| Class | Description | Examples | Access Control |
|-------|-------------|----------|----------------|
| PUBLIC | Marketing, public filings | Website content, fund prospectuses | No restriction |
| INTERNAL | Non-sensitive business data | Branch directories, training materials | Role-based |
| CONFIDENTIAL | Client PII, portfolio data | SSN, account numbers, holdings, performance | Role + MFA + Need-to-know |
| RESTRICTED | Highly sensitive financial data | Tax documents, estate plans, settlement records | Role + MFA + JIT + Manager approval |

### 6.2 Need-to-Know Rules
- Advisors may only access clients formally assigned to them in the CRM
- Branch Managers may access all clients in their branch for supervision purposes
- Compliance Officers may access client data for surveillance (read-only)
- No role may bulk-export >50 client records without DLP scan + Compliance approval
- Client data access logs retained for 7 years per FINRA 3110 / SEC 17a-4

### 6.3 Cross-Border Data Rules
- EU client data may only be accessed by EU-licensed advisors or under approved data transfer agreements
- APAC client data requires local branch identity + additional MFA step
- US client data accessible to US-based identities only (no offshore access without exception)

---

## 7. Third-Party & Vendor Access Rules

### 7.1 Vendor Onboarding Requirements
- Security assessment (SOC 2 Type II or equivalent) within 12 months
- Background checks for vendor personnel with CONFIDENTIAL access
- Signed NDA and data processing agreement (DPA)
- IP whitelist or mTLS for API access
- Annual re-certification mandatory

### 7.2 Vendor Access Tiers
| Tier | Risk Score | IAM Policy | Review Frequency |
|------|------------|------------|------------------|
| T1 — Trusted | 0–30 | Standard scoped access | Annual |
| T2 — Moderate | 31–70 | MFA + IP restrict + limited scope | Semi-annual |
| T3 — Elevated | 71–90 | JIT only + manager approval per session | Quarterly |
| T4 — Quarantined | 91–100 | Immediate suspension pending review | Immediate |

### 7.3 Vendor Offboarding
- All vendor accounts must be deactivated within 24 hours of contract termination
- API keys revoked immediately
- Access logs exported for 90-day retention
- Final security review before re-engagement

---

## 8. Non-Human Identity (NHI) Governance

### 8.1 Service Account Types
| Type | Purpose | Auth Method | Rotation | Owner |
|------|---------|-------------|----------|-------|
| API-KEY | External integrations | mTLS + API key | 90 days | Engineering |
| SERVICE-ACCT | Internal microservices | OAuth 2.0 / SPIFFE | 180 days | Engineering |
| RPA-BOT | Robotic process automation | Certificate-based | 90 days | Operations |
| CI-CD | Deployment pipelines | OIDC / short-lived tokens | 1 hour | DevOps |

### 8.2 NHI Rules
- All service accounts must have a named human owner
- No shared service account credentials (one secret per identity)
- Service accounts cannot have interactive login privileges
- Service accounts with RESTRICTED zone access require JIT elevation + approval
- NHI access reviewed weekly by Engineering + Security

---

## 9. Exception Management

### 9.1 Exception Types
| Type | Description | Max Duration | Approval |
|------|-------------|--------------|----------|
| TEMP-ELEV | Temporary role elevation | 30 days | Manager + Compliance |
| SoD-EXCP | SoD rule override | 90 days | CISO + Compliance |
| EMERGENCY | Break-glass access | 4 hours | On-call Security + post-hoc CISO |
| VENDOR-EXCP | Vendor access beyond standard tier | 180 days | Vendor Mgmt + Security |

### 9.2 Exception Process
1. Requester submits exception with business justification + compensating controls
2. AI generates risk score + exception narrative
3. Route to required approvers based on exception type
4. If approved: time-bound provision + mandatory review date + enhanced logging
5. If denied: log + notify + suggest alternative role/permission
6. All exceptions reported to Audit Committee quarterly

### 9.3 Compensating Controls (Examples)
- Enhanced logging and real-time monitoring
- Dual-control (second person required for critical actions)
- Shortened session timeouts
- Additional MFA step
- Daily manager review of all actions taken under exception

---

## 10. Audit & Compliance Requirements

### 10.1 Regulatory Frameworks
| Framework | Relevance | IAM Requirement |
|-----------|-----------|-----------------|
| FINRA 3110 | Supervision | Quarterly access reviews, supervisor oversight |
| SEC 17a-4 | Record retention | 7-year audit log retention, WORM storage |
| SOX 404 | Internal controls | SoD enforcement, quarterly recertification for financial roles |
| GLBA | Privacy | Client data access controls, need-to-know enforcement |
| GDPR | EU privacy | Data minimization, right to erasure (identity deactivation) |
| CCPA | CA privacy | Consumer data access rights, identity verification |

### 10.2 Audit Log Requirements
- All authentication events (success + failure)
- All access requests (submit, approve, deny, provision, revoke)
- All role modifications (who, what, when, before/after)
- All SoD conflicts detected and resolutions
- All exception grants and renewals
- All client data access (what record, who, when, action)
- All NHI credential rotations

### 10.3 Quarterly Access Recertification
- All roles with CONFIDENTIAL or RESTRICTED access must be recertified by direct manager
- All SoD exceptions must be reviewed by Compliance
- All vendor access must be re-validated by Vendor Management
- All service accounts must be re-attested by Engineering owners
- Non-responsive recertifications auto-suspend after 14 days

### 10.4 Policy Version Control
- All policy changes require CISO approval
- Previous versions retained for 7 years
- Change log maintained with business justification
- Emergency policy changes require post-hoc review within 48 hours

---

## Appendix A: Ameriprise-Specific Business Context

### A.1 Advisor Model
Ameriprise operates a **hybrid advisor model**:
- **Franchise Advisors (ADV-IND):** Independent contractors operating under Ameriprise brand. Own their book of business. Access Ameriprise systems but not corporate HR systems.
- **Employee Advisors (ADV-EMP):** W-2 employees. Full corporate access + advisor portal.
- **Private Wealth Advisors (PWA):** Serve UHNW clients ($5M+ AUM). Access alternative investments, complex estate planning tools.

### A.2 Key Systems
| System | Zone | Primary Users | Data Class |
|--------|------|---------------|------------|
| Advisor Portal | ZONE-ADVISOR | All advisors | CONFIDENTIAL |
| CRM (Salesforce) | ZONE-CONFIDENTIAL | Advisors, Ops, Compliance | CONFIDENTIAL |
| Portfolio Management | ZONE-CONFIDENTIAL | Senior Advisors, PWAs | CONFIDENTIAL |
| Trading Platform | ZONE-RESTRICTED | Senior Advisors, Ops | RESTRICTED |
| Settlement System | ZONE-RESTRICTED | Operations | RESTRICTED |
| General Ledger | ZONE-RESTRICTED | Finance | RESTRICTED |
| IAM Admin Console | ZONE-RESTRICTED | IAM Admins | RESTRICTED |
| Data Warehouse | ZONE-RESTRICTED | Analytics, Compliance | RESTRICTED |
| Marketing Cloud | ZONE-PUBLIC | Marketing, Vendors | INTERNAL |
| DevOps Platform | ZONE-DEV | Engineering | INTERNAL |

### A.3 Seasonal Considerations
- **Tax Season (Jan–Apr):** Enhanced monitoring on TAX_LOSS_HARVESTING_INITIATE and CLIENT_DATA_EXPORT
- **Year-End (Dec):** Freeze on non-essential role changes; accelerated recertification for financial roles
- **M&A Activity:** Temporary exception process for acquired firm integration; SoD rules suspended only for mapping phase (max 30 days)

---

*Document Version: 1.0.0*
*Last Updated: 2026-06-01*
*Next Review: 2026-09-01*
*Owner: Identity Governance Team, CISO Office*
