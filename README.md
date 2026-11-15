# Partner Portal prototype

A clickable, single-page prototype of a partner portal for a managed security services provider (MSSP).
Partners register deals, find sales material and track commission. The vendor approves each deal,
application, tier change and payout in three steps.
**All companies, people and figures are fictional sample data. "Northwind Security" is a fictional company.**

| Sign-in with demo accounts | Partner dashboard |
|---|---|
| ![Sign-in page with demo accounts](images/01-sign-in.png) | ![Partner dashboard](images/02-partner-dashboard.png) |
| **Three-step deal approval (vendor view)** | **Commissions** |
| ![Deal waiting for final approval](images/03-deal-approval.png) | ![Commission lines and sample tier rates](images/04-commissions.png) |

## What it does

The portal has two sides that share one data set:

- **Partner side** (resellers, MSPs, referral partners and distributors): apply to join, register
  opportunities, follow approvals, download sales material, take training, raise support cases and
  track commission. Partner roles are Partner Admin, Sales, Technical and Finance, and each role sees
  only its own menu items (for example, Sales cannot see commissions).
- **Vendor side** (the MSSP's own staff): Partner Managers who each cover one or more territories,
  a step-2 approver, a final approver, Marketing, Finance and a Portal Admin. Staff only see partners
  and deals in their own territories.

Everything runs in the browser. There is no server: the sample data is created on first load and
saved in the browser's `localStorage`, so changes survive a page refresh until you click **Reset data**.
All dates are relative to today, so the demo always looks current.

## The three-step approval flow

Deal registrations, partner applications, tier changes and commission payouts all go through the same
three steps:

1. **Owner review**: the partner's own Partner Manager checks the item (for a deal: verification
   checks, evidence and possible conflicts) and approves, asks for more information, or rejects.
2. **Second approval**: a step-2 approver approves, sends back or rejects.
3. **Final approval**: the final approver signs off. Only then is a deal protected, an applicant
   given a partner account, a tier changed or a payout released.

Every step is time-stamped in the item's history and in the audit log. An item waiting 2 working
days at one step shows "Reminder sent", and after 4 working days it is marked overdue.

### Rules built into the demo

- **Deal checks**: company identified (registration number and website), a business email address
  (personal addresses such as free-mail domains are blocked) and proof of budget (letter of intent,
  purchase order or tender) are required. A recent meeting, proof of engagement and customer
  confirmation by email are optional extras.
- **Duplicate detection**: registering a customer that another partner already registered raises a
  conflict for the vendor to resolve; the first valid, active registration normally wins.
- **Protection**: 90 days from approval, plus one 30-day extension on request. A deal with no progress
  update for 30 days shows "Update due"; after 50 days it becomes "Inactive", protection is suspended
  and the customer can be given to another partner (again through three approvals).
- **Commission**: deal value x the partner's tier rate when the deal is marked as won. The tier rates
  in the demo (Registered 10%, Silver 15%, Gold 20%, Platinum 25%) are **illustrative sample values,
  not real commercial terms**. Commission moves from "Awaiting invoice" to "Invoice submitted" to
  "Ready for payment" to "Paid".
- **Currencies**: each territory trades in its own currency (MYR, SGD, LKR, USD); staff also see a
  ringgit equivalent using sample exchange rates.

## Features

**Partner side**
- Application form with territory-based Partner Manager choice and a consent check
- Sign-in with simulated two-step verification
- Dashboard with pipeline, won sales, commission and tier progress, plus an action list
  (updates due, protection ending, invoices needed)
- Deal registration form in three pages (customer, opportunity, review and submit) with
  verification checks, a duplicate warning and a preview of the confirmation email sent to the
  customer contact
- Deal pages with approval tracker, protection timer, progress updates, documents and history
- Product catalogue with positioning notes, local prices and margin per tier
- Resource library gated by tier, marketing campaigns and a co-branding kit
- Training courses and certificates; partner program page with tier requirements and benefits
- Customers page with sample service reports, support cases, announcements and notifications
- Company settings: users and roles, invitations restricted to the company's own email domain,
  sessions and a security log

**Vendor side**
- "My approvals" queue for each approver, with territory filtering
- Conflict resolution between partners, extension requests and tier change requests
- Partner applications, invitations and partner management
- Payout approvals and payment recording for Finance
- Content publishing for Marketing (resources and announcements)
- Staff handover when someone leaves (partners and approval steps are reassigned)
- Audit log of every sign-in, change and administrative action
- A "Viewing as" switcher in the demo strip to act as any staff member

## How to run it

1. Open `index.html` in a recent browser (Chrome, Edge, Firefox or Safari). No server or install is needed.
2. On the sign-in page, click **Use** next to any demo account. Any password and any 6-digit code work.
3. Open **Demo guide** in the yellow strip for a short walkthrough: register a deal as a partner,
   switch to the vendor view, and approve it through all three steps.
4. Click **Reset data** in the strip at any time to return to the original sample data.

## How to rebuild it

The page is built from the files in `src/`:

```
partner-portal-demo/
  index.html        built single-file demo (open this)
  build.py          packs src/ into index.html
  src/
    app.js          all screens, rules and actions (plain JavaScript, no framework)
    seed.js         the fictional sample data
    style.css       styles
    logo.svg        the fictional wordmark
  diagrams/         Mermaid sources of the diagrams below
  images/           screenshots
```

Edit the files in `src/`, then run (Python 3, no packages needed):

```
python3 build.py
```

`build.py` inlines `seed.js` and the logo into `app.js`, and writes one self-contained `index.html`.
To syntax-check the combined script as well, run `python3 build.py check.js && node --check check.js`.

## Architecture

The prototype is a single page, but it was designed against a proposed production architecture,
which is **not built**. The diagrams below describe that design. Their sources are in `diagrams/`.

### Use cases: partner side

```mermaid
flowchart LR
  APP["Applicant<br/>company not yet a partner"]
  PU["Any partner user<br/>every role below"]
  PS["Partner Sales"]
  PT["Partner Technical"]
  PF["Partner Finance"]
  PA["Partner Admin<br/>also everything above"]

  subgraph PORTAL["Partner side"]
    P1(["Apply to join, choose a Partner Manager"])
    P2(["Sign in with two-step verification"])
    P3(["View dashboard, tier and notifications"])
    P4(["Read announcements and messages"])
    P5(["Complete training, get certified"])
    P6(["Raise and follow support cases"])
    P7(["Browse products and local prices"])
    P8(["Register a deal with proof of budget"])
    P9(["Post progress, add documents, won or lost"])
    P15(["View deal status"])
    P10(["Download sales resources"])
    P11(["Use the marketing kit"])
    P12(["View customer services and reports"])
    P13(["View commissions, upload invoices"])
    P14(["Manage team, roles and sessions"])
  end

  APP --- P1
  PU --- P2
  PU --- P3
  PU --- P4
  PU --- P6
  PS --- P7
  PS --- P8
  PS --- P9
  PS --- P10
  PS --- P11
  PS --- P5
  PT --- P7
  PT --- P15
  PT --- P5
  PT --- P10
  PT --- P12
  PF --- P13
  PA --- P14

  classDef actor fill:#FFFFFF,stroke:#1B2B3C,color:#1B2B3C
  classDef uc fill:#FFFFFF,stroke:#3C4650,color:#1B2B3C
  classDef content fill:#EAF1F7,stroke:#1F4E79,color:#173B5C
  class APP,PU,PS,PT,PF,PA actor
  class P1,P2,P3,P5,P6,P8,P9,P10,P12,P13,P14,P15 uc
  class P4,P7,P11 content
```

### Use cases: vendor side

```mermaid
flowchart LR
  subgraph PORTAL["Northwind Security side"]
    S16(["Sign in with Microsoft Entra ID"])
    S1(["Invite partners, review applications"])
    S2(["Verify and approve deals (step 1)"])
    S3(["Resolve conflicts between partners"])
    S4(["Monitor deals, approve extensions"])
    S5(["Request a tier change"])
    S6(["Answer partner support cases"])
    S7(["Message their own partners"])
    S8(["Request content from Marketing"])
    S9(["Approve step 2 and the final step"])
    S10(["Reassign partner owners"])
    S19(["Record payments to partners"])
    S13(["Handle content requests"])
    S11(["Publish resources and price lists"])
    S12(["Post company announcements"])
    S14(["Manage staff accounts and roles"])
    S15(["Offboard leavers, hand over partners"])
    S17(["Review the audit log"])
    S18(["Confirm the deal by email"])
  end

  ALL["Any Northwind Security staff<br/>every role below"]
  CM["Partner Manager<br/>owner, one per territory, step 1"]
  DF["Approvers<br/>step 2 and final approval"]
  FN["Northwind Security Finance<br/>pays approved payouts"]
  MK["Marketing<br/>content team"]
  AD["Portal Admin<br/>staff accounts only"]
  SOC[["SOC / SIEM<br/>system, not a person"]]
  CU["Customer contact<br/>not a portal user"]

  S16 --- ALL
  S1 --- CM
  S2 --- CM
  S3 --- CM
  S4 --- CM
  S5 --- CM
  S6 --- CM
  S7 --- CM
  S8 --- CM
  S9 --- DF
  S10 --- DF
  S19 --- FN
  S13 --- MK
  S11 --- MK
  S12 --- MK
  S14 --- AD
  S15 --- AD
  S17 --- AD
  S17 --- SOC
  S18 --- CU

  classDef actor fill:#FFFFFF,stroke:#1B2B3C,color:#1B2B3C
  classDef uc fill:#FFFFFF,stroke:#3C4650,color:#1B2B3C
  classDef content fill:#EAF1F7,stroke:#1F4E79,color:#173B5C
  classDef system fill:#F8F9FB,stroke:#9AA0A8,color:#1B2B3C
  class ALL,CM,DF,FN,MK,AD,CU actor
  class S16,S1,S2,S3,S4,S5,S6,S8,S9,S10,S13,S14,S15,S17,S18,S19 uc
  class S7,S11,S12 content
  class SOC system
```

### Hand-offs: partner actions that create a task for the vendor

```mermaid
flowchart LR
  P1(["Partner: apply to join the program"]) -. creates task .-> S1(["Northwind Security: review partner applications"])
  P6(["Partner: raise a support ticket"]) -. creates task .-> S5(["Northwind Security: answer partner tickets"])
  P8(["Partner: register a deal, with proof"]) -. creates task .-> S13(["Customer: confirm the deal by email"])
  P8 -. creates task .-> S6(["Northwind Security: verify, approve or reject deals"])
  P9(["Partner: ask for a 30-day extension"]) -. creates task .-> S7(["Northwind Security: approve 30-day extensions"])
  P13(["Partner: upload invoice"]) -. creates task .-> S10(["Northwind Security: release commission payouts"])

  classDef partner fill:#FFFFFF,stroke:#3C4650,color:#1B2B3C
  classDef staff fill:#EAF1F7,stroke:#1F4E79,color:#173B5C
  class P1,P6,P8,P9,P13 partner
  class S1,S5,S6,S7,S10,S13 staff
```

### Hand-offs: what the vendor publishes for partners

```mermaid
flowchart LR
  S4(["Northwind Security: post company updates"]) == publishes ==> P4(["Partner: read news and updates"])
  S8(["Northwind Security: publish resources and marketing kit"]) == publishes ==> P10(["Partner: download sales resources"])
  S8 == publishes ==> P11(["Partner: use the marketing kit"])

  classDef partner fill:#FFFFFF,stroke:#3C4650,color:#1B2B3C
  classDef staff fill:#EAF1F7,stroke:#1F4E79,color:#173B5C
  class P4,P10,P11 partner
  class S4,S8 staff
```

### System architecture (proposed)

```mermaid
flowchart LR
  PUSR["Partner users<br/>browser, any device"]
  STAFF["Northwind Security staff<br/>browser, company laptop"]
  FD["Azure Front Door + firewall (WAF)<br/>TLS 1.2+ and HSTS, DDoS protection<br/>OWASP attack rules, rate limits<br/>bot block, bad-IP and geo rules<br/>the only public entry point"]

  subgraph PRIV["Private network - Azure, Malaysia region - no public access to app data"]
    AC["Access check<br/>role allowed? own company?"]
    APPN["Portal app (web + API)<br/>sign-in, two-step, sessions<br/>deals and duplicate check<br/>products, news, resources<br/>training and certificates<br/>commissions and payouts<br/>tickets and notifications<br/>audit logger (every action)"]
    DB[("PostgreSQL database<br/>row-level security per partner<br/>encrypted, daily tested backups")]
    BLOB[("File storage (Blob)<br/>private, encrypted, versioned")]
    SCAN["Malware scanner<br/>every upload, before use"]
    KV["Key Vault<br/>passwords, keys, certificates"]
  end

  ENTRA["Microsoft Entra ID<br/>staff login + MFA"]
  MAIL["Email service<br/>alerts to users"]
  SIEM["Northwind Security SIEM<br/>watched by the SOC"]
  CRM["CRM<br/>Phase 3"]

  PUSR -->|HTTPS| FD
  STAFF -->|HTTPS| FD
  FD -->|clean traffic| AC
  AC -->|allowed requests| APPN
  APPN -->|SQL| DB
  APPN -->|files, links expire in 5 min| BLOB
  BLOB -->|scan| SCAN
  APPN -->|keys| KV
  APPN -->|staff SSO| ENTRA
  APPN -->|sends| MAIL
  APPN -->|audit + security events| SIEM
  APPN -.->|deal sync| CRM

  classDef key fill:#EAF1F7,stroke:#1F4E79,color:#173B5C
  classDef data fill:#FFFFFF,stroke:#8FA6BC,color:#1B2B3C
  classDef later fill:#FFFFFF,stroke:#9AA0A8,stroke-dasharray:5 4,color:#5E6269
  class AC key
  class DB,BLOB,SCAN,KV data
  class CRM later
```

### Security checks on every request

```mermaid
flowchart LR
  REQ(["Every request"]) --> C1["1. Firewall<br/>blocks attacks, bots"]
  C1 -->|pass| C2["2. Signed in?<br/>valid session cookie"]
  C2 -->|yes| C3["3. Two-step done?<br/>code or passkey"]
  C3 -->|yes| C4["4. Role allows it?<br/>e.g. Sales cannot see commissions"]
  C4 -->|yes| C5["5. Own company?<br/>row-level security"]
  C5 -->|yes| C6["6. Do the action<br/>input validated"]
  C6 --> LOG["Audit log<br/>copy sent to SOC"]

  C1 -->|fail| BLOCK["Blocked: request refused<br/>sign in again, or not allowed<br/>recorded as a security event"]
  C2 -->|no| BLOCK
  C3 -->|no| BLOCK
  C4 -->|no| BLOCK
  C5 -->|no| BLOCK
  BLOCK -->|logged| LOG

  classDef key fill:#EAF1F7,stroke:#1F4E79,color:#173B5C
  classDef bad fill:#FDECEC,stroke:#B3261E,color:#B3261E
  class C4,C5 key
  class BLOCK bad
```

### Deal registration, step by step

```mermaid
sequenceDiagram
  autonumber
  actor S as Partner Sales
  participant P as Portal app
  participant D as Database
  actor C as Partner Manager
  participant E as Email
  actor K as Customer contact
  actor F as Step-2 approver
  actor X as Final approver
  S->>P: Submit deal (customer, contact, services, value, proof of budget)
  P->>P: Check role, validate every field, block personal email addresses
  P->>D: Search active deals for the same customer
  D-->>P: Match found or no match
  P->>D: Save as Pending, with evidence and conflict flag
  P->>E: Ask the customer contact to confirm the opportunity
  E-->>K: Please confirm: Northwind Security services with this partner
  K->>P: Yes, I confirm (or No, this is not correct)
  P->>E: Tell the partner's own Partner Manager a deal is waiting
  E-->>C: New deal to review (own territory only)
  C->>P: Check verification, then approve step 1, request information or reject
  P->>F: Step 2 of 3: second approval
  F->>P: Approve, send back or reject
  P->>X: Step 3 of 3: final approval
  X->>P: Approve, send back or reject
  Note over P,X: Reminder after 2 working days at any step, and after 4 the item is flagged and escalated
  P->>D: Approved, protected for 90 days
  P->>E: Tell the partner the decision
  E-->>S: Deal approved, protected until date
  loop At least every 30 days until won or lost
    S->>P: Post progress update (stage, note, next step)
    P->>D: Save update, reset the activity clock
  end
  Note over P,C: No update for 30 days: reminder. No update for 50 days: protection suspended and the customer can go to another partner
  Note over P,D: Every step above is written to the audit log
```

### Deal stages

```mermaid
stateDiagram-v2
  direction TB
  [*] --> Pending: partner submits
  Pending --> Approved: Partner Manager, step-2 approver and final approver approve
  Pending --> Rejected: rejected with reason
  state Approved {
    state "Update due" as UpdateDue
    [*] --> Active
    Active --> UpdateDue: 30 days, no update
    UpdateDue --> Inactive: 50 days, no update
    UpdateDue --> Active: progress update
    Inactive --> Active: progress update
  }
  Approved --> Won: deal won
  Approved --> Lost: partner marks lost
  Approved --> Lost: inactive, customer given to another partner
  Approved --> Expired: protection period ends
  Won --> [*]
  Lost --> [*]
  Rejected --> [*]
  Expired --> [*]
```

### Commission stages

```mermaid
stateDiagram-v2
  direction TB
  state "Awaiting invoice" as A
  state "Invoice submitted" as I
  state "Paid" as P
  [*] --> A: deal marked Won (tier rate applied)
  A --> I: partner uploads invoice
  I --> P: Partner Manager, step-2 approver and final approver approve
  P --> [*]
```

### How sign-in works

```mermaid
sequenceDiagram
  actor U as Partner user
  participant W as Firewall
  participant P as Portal app
  participant A as Sign-in service
  participant L as Audit log / SOC
  U->>W: Open portal
  W->>P: Request allowed
  U->>P: Email and password
  P->>A: Check password (stored hashed), count attempts
  alt 5 wrong attempts
    A-->>P: Lock account for 15 minutes
    P->>L: Security event, SOC alerted
  else password correct
    P-->>U: Ask for 6-digit code or passkey
    U->>P: Code
    P->>A: Verify code
    A-->>P: Correct
    P-->>U: Secure session, ends after 30 min idle
    P->>L: Signed in (who, when, where)
  end
```

### Data model

```mermaid
erDiagram
  TIER ||--o{ PARTNER : "sets margin for"
  APPLICATION |o--o| PARTNER : "becomes"
  PARTNER ||--o{ USER : "employs"
  STAFF ||--o{ PARTNER : "manages"
  STAFF ||--o{ APPROVAL_STEP : "decides"
  DEAL ||--o{ APPROVAL_STEP : "approved through"
  PARTNER ||--o{ DEAL : "registers"
  USER ||--o{ DEAL : "submits"
  DEAL ||--o{ DEAL_EVENT : "history"
  DEAL ||--o{ EVIDENCE : "proven by"
  DEAL ||--o| COMMISSION : "earns"
  PARTNER ||--o{ TICKET : "raises"
  TICKET ||--o{ MESSAGE : "contains"
  USER ||--o{ ENROLMENT : "takes"
  COURSE ||--o{ ENROLMENT : "has"
  TIER ||--o{ RESOURCE : "unlocks"
  PRODUCT ||--o{ RESOURCE : "has material"
  DEAL }o--o{ PRODUCT : "includes"
  NEWS_POST ||--o{ NEWS_READ : "read by"
  USER ||--o{ NEWS_READ : "reads"
  USER ||--o{ SESSION : "has"
  USER ||--o{ AUDIT_EVENT : "performs"
  PARTNER {
    uuid id PK
    string name
    string country
    string type
    uuid tier_id FK
    uuid partner_manager_id FK
    string status
  }
  STAFF {
    uuid id PK
    string name
    string territory
    string approver_level
  }
  APPROVAL_STEP {
    uuid id PK
    string item_type
    string item_id
    int step
    uuid approver_id FK
    string decision
    string note
    timestamp decided_at
  }
  USER {
    uuid id PK
    uuid partner_id FK
    string email
    string role
    string mfa_method
    string status
  }
  DEAL {
    string id PK
    uuid partner_id FK
    string customer
    string customer_reg_no
    string contact_email
    decimal value
    string currency
    string stage
    string status
    string customer_confirmation
    date last_activity
    date protected_until
  }
  EVIDENCE {
    uuid id PK
    string deal_id FK
    string type
    string file_ref
    uuid uploaded_by FK
    timestamp uploaded_at
  }
  COMMISSION {
    uuid id PK
    string deal_id FK
    decimal rate
    decimal amount
    string status
  }
  AUDIT_EVENT {
    uuid id PK
    uuid user_id FK
    string action
    string level
    timestamp at
  }
```

### Build phases (proposed)

```mermaid
flowchart LR
  subgraph PH1["Phase 1 - Launch (MVP), about 8 to 10 weeks"]
    direction TB
    A1["Apply, sign in with two-step, dashboard"]
    A2["Deal registration and approvals"]
    A3["Products, resources, announcements, program page"]
    A4["Company settings: users, roles, sessions"]
    A5["Staff: tiers, publishing, audit log to SOC"]
    A6["All security checks + penetration test"]
    A1 ~~~ A2 ~~~ A3 ~~~ A4 ~~~ A5 ~~~ A6
  end
  subgraph PH2["Phase 2 - Enablement, about 6 to 8 weeks"]
    direction TB
    B1["Training and certificates"]
    B2["Commissions, invoices, payouts"]
    B3["Customers, services and reports"]
    B4["Support cases"]
    B5["Marketing campaigns"]
    B1 ~~~ B2 ~~~ B3 ~~~ B4 ~~~ B5
  end
  subgraph PH3["Phase 3 - Scale, about 6 to 8 weeks"]
    direction TB
    C1["Quote builder"]
    C2["Marketing funds (MDF)"]
    C3["Co-selling, partner locator"]
    C4["CRM integration"]
    C5["Partner analytics"]
    C1 ~~~ C2 ~~~ C3 ~~~ C4 ~~~ C5
  end
  PH1 ==> PH2 ==> PH3
```

## Limitations

This is a prototype for walking through the workflow, not a working system:

- No backend, database or real authentication. Any password works and sign-in is simulated.
- File uploads, emails, malware scanning and the SOC integration are shown but not performed.
- Data lives only in the visitor's own browser.

## About the data

All data in this project is fictional sample data: "Northwind Security", the partner companies,
customers, people, email addresses (`.example` domains and `example.com`), registration numbers,
phone numbers, prices, deal values, targets and commission rates. Any resemblance to real
organisations or people is coincidental.
