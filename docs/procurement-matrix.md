# Public Procurement Flow (Infrastructure) — Requirements Matrix

> Source baseline: Philippine government procurement law & standard infra bidding docs (generic, agency-agnostic).  
> Intent: digitize the stages, documents, clocks, and roles without relying on any DPWH-internal SOP.

## Roles (system roles we’ll map to RBAC)
- **End-User/PMO** – prepares scope/cost; manages implementation
- **BAC** – facilitates bid; issues resolutions
- **TWG** – technical evaluation
- **HOPE** – approves award
- **COA/Observers** – non-voting; audit trail only
- **Contractor** – bidder/awardee

## Stage model (status & events)

| Stage Code | Stage Name                         | Description (what happens)                                                  | Required Documents (minimum)                                             | Default Clock* |
|------------|------------------------------------|------------------------------------------------------------------------------|---------------------------------------------------------------------------|----------------|
| plan       | Planning                           | Define scope, budget, schedule                                               | PPMP/PR, Program of Work, Cost Estimates                                  | configurable   |
| preproc    | Pre-proc Conference                | BAC reviews bidding strategy & docs                                          | BAC Resolution (Pre-proc), Draft PBDs                                     | configurable   |
| post       | Advertisement/Posting              | Post ITB on PhilGEPS, website, conspicuous places                            | ITB Notice link/ID, Posting Proof                                         | 7–14d default  |
| prebid     | Pre-Bid Conference                 | Clarifications; issue Minutes/Supplemental Bid Bulletin                      | Minutes, SBB #1..n                                                        | configurable   |
| open       | Bid Submission & Opening           | Receive bids; open & record                                                  | Bid Receipt Log, Abstract of Bids                                         | 1d default     |
| eval       | Bid Evaluation                     | Detailed evaluation (financial/technical)                                    | Bid Evaluation Report                                                     | ≤7d default    |
| postqual   | Post-Qualification                 | Lowest calc. responsive bidder, verify docs/sites                            | Post-Qual Report, Due-diligence notes                                     | ≤20d default   |
| award      | BAC Resolution & HOPE Approval     | Recommend & approve award                                                    | BAC Resolution (Award), HOPE Approval                                     | ≤7d default    |
| noa        | Notice of Award (NOA)              | Issue NOA to winning bidder                                                  | NOA, Bid Acceptance                                                       | ≤3d default    |
| contract   | Contract Signing                    | Prepare & sign contract, bonds, insurances                                   | Contract, Performance Bond, Insurance, Notarized Docs                     | ≤10d default   |
| ntp        | Notice to Proceed (NTP)            | Issue NTP; set start date                                                    | NTP                                                                        | ≤7d default    |
| ongoing    | Implementation / Progress          | Execution; progress & disbursements                                          | Work Schedules, Progress Reports, IPCs/Disbursement Vouchers, Variation Orders | monthly        |
| complete   | Substantial/Final Completion       | Punchlist/acceptance                                                          | Certificate of Completion, Acceptance, As-Built                           | configurable   |
| closed     | Project Closed                     | Final turn-over & audit close                                                | Final Billing, Turnover Checklist                                         | configurable   |

\* “Default Clock” = system’s initial target durations; **configurable per tenant**.

### Event types we will store
- `stage_changed` (with from→to, by whom)
- `doc_uploaded` (doc_type, url, metadata)
- `procurement_milestone` (e.g., “SBB #2 issued”)
- `financial_disbursement` (amount, date, UACS code)
- `progress_update` (progress_pct, remarks)

## Document types (minimum set)
- `ppmp`, `pow`, `itb_posting`, `minutes_prebid`, `sbb`, `abstract_of_bids`,
  `ber` (bid evaluation report), `pqr` (post-qual report), `bac_reso_award`,
  `hope_approval`, `noa`, `contract`, `performance_bond`, `insurance`,
  `ntp`, `progress_report`, `ipc` (interim payment cert)/`dv`, `vo` (variation order),
  `completion_cert`, `acceptance_cert`, `as_built`

## Data we’ll track on each project (additive to current schema)
- Location: `region`, `province`, `city_muni`, `latitude`, `longitude`
- Financials: `abc_amount`, `contract_amount`
- Procurement: `proc_status` (enum: plan, preproc, post, prebid, open, eval, postqual, award, noa, contract, ntp, ongoing, complete, closed)
- Dates: `start_date`, `target_end_date`
- Progress: `progress_pct` (0–100)
- Contractor: `contractor_id` (links to `contractors`)

