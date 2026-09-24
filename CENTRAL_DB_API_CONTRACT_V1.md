# Mudagiri Central DB API V1

## POST /v1/diagnoses
Accepts `DiagnosisFactV1 + anonymousUserId + acquisition`. Server transaction inserts one `analytics.diagnoses` row and 12 `analytics.diagnosis_categories` rows. `diagnosis_id` is idempotent: retry must not duplicate.

## POST /v1/events
Accepts `FunnelEventV1`. `event_id` is idempotent. Only permitted event names from the app contract are accepted.

## POST /v1/leads
Accepts `LeadProfileV1 + anonymousUserId`. Stored only in `crm.leads`; LINE identifiers must never be copied into analytics tables.

## GET /v1/benchmarks
Query: category, household, familyProfile, ageBand, incomeBand, prefecture. Server returns the most specific cell with n>=100; 30-99 may be internal-only and n<30 must never be exposed. Response must state the actual dimensions used and n.

## Security / privacy gates
- TLS only; API key or server-side session validation.
- Validate schema/version and reject unknown fields server-side.
- Rate limit writes; log ingestion failures without logging household payloads.
- Benchmark endpoint never returns row-level data.
- Benchmark aggregation only uses `consent_benchmark=true` and latest diagnosis per anonymous user.
- CRM access is role-restricted and separate from benchmark/analytics access.
- Retention/deletion policy must be documented before public launch.
