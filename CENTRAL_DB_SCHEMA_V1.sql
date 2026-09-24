-- PostgreSQL 15+ / Supabase-compatible. Anonymous analytics and CRM are separated by schema.
create extension if not exists pgcrypto;
create schema if not exists analytics;
create schema if not exists crm;

create table if not exists analytics.diagnoses (
  diagnosis_id text primary key,
  anonymous_user_id text not null,
  created_at timestamptz not null,
  schema_version text not null,
  methodology_version text not null,
  consent_analytics boolean not null default false,
  consent_benchmark boolean not null default false,
  prefecture text not null,
  age integer not null,
  age_band text not null,
  family_profile text not null,
  household text not null,
  annual_income numeric not null,
  income_band text not null,
  monthly_take_home_income numeric not null,
  monthly_saving_investment numeric not null,
  free_cash_flow numeric not null,
  emergency_months numeric not null,
  saving_rate numeric,
  tone_mode text not null,
  future_goal text,
  global_satisfaction smallint not null,
  type_code text not null,
  axis_fv numeric not null, axis_pi numeric not null, axis_au numeric not null, axis_se numeric not null,
  battle_score integer not null,
  monthly_improvement numeric not null,
  annual_improvement numeric not null,
  five_year_improvement numeric not null,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  referrer text, landing_path text
);
create index if not exists diagnoses_segment_idx on analytics.diagnoses(household,age_band,income_band,prefecture,created_at desc);
create index if not exists diagnoses_anon_latest_idx on analytics.diagnoses(anonymous_user_id,created_at desc);

create table if not exists analytics.diagnosis_categories (
  diagnosis_id text not null references analytics.diagnoses(diagnosis_id) on delete cascade,
  category text not null,
  amount numeric,
  amount_state text not null,
  comparable numeric,
  difference numeric,
  satisfaction text,
  outcome text not null,
  monthly_improvement numeric not null,
  primary key(diagnosis_id,category)
);

create table if not exists analytics.funnel_events (
  event_id text primary key,
  anonymous_user_id text not null,
  diagnosis_id text not null,
  name text not null,
  created_at timestamptz not null,
  data jsonb not null default '{}'::jsonb
);
create index if not exists funnel_dx_idx on analytics.funnel_events(diagnosis_id,created_at);

-- CRM PII/identifiers stay outside analytics schema.
create table if not exists crm.leads (
  lead_id text primary key,
  diagnosis_id text unique not null,
  anonymous_user_id text not null,
  created_at timestamptz not null,
  stage text not null,
  line_user_id text,
  source text,
  campaign text,
  future_goal text,
  type_code text not null,
  annual_income_band text not null,
  family_profile text not null,
  needs_review jsonb not null default '[]'::jsonb,
  unknown_categories jsonb not null default '[]'::jsonb,
  monthly_improvement numeric not null,
  appointment jsonb
);

-- Benchmark source: one latest consented diagnosis per anonymous user to prevent repeat-user distortion.
create or replace view analytics.latest_benchmark_diagnoses as
select * from (
  select d.*, row_number() over(partition by anonymous_user_id order by created_at desc) rn
  from analytics.diagnoses d
  where consent_benchmark=true
) x where rn=1;

create materialized view if not exists analytics.mudagiri_benchmarks as
select c.category,d.household,d.family_profile,d.age_band,d.income_band,d.prefecture,
       count(*)::int n,
       round(avg(c.amount)) mean,
       round(percentile_cont(.25) within group(order by c.amount)) p25,
       round(percentile_cont(.50) within group(order by c.amount)) median,
       round(percentile_cont(.75) within group(order by c.amount)) p75,
       round(percentile_cont(.90) within group(order by c.amount)) p90,
       round(stddev_pop(c.amount)) stddev,
       now() updated_at
from analytics.latest_benchmark_diagnoses d
join analytics.diagnosis_categories c using(diagnosis_id)
where c.amount_state in ('known','zero') and c.amount is not null
group by grouping sets (
 (c.category,d.household,d.family_profile,d.age_band,d.income_band,d.prefecture),
 (c.category,d.household,d.family_profile,d.age_band,d.income_band),
 (c.category,d.household,d.age_band,d.income_band),
 (c.category,d.household,d.income_band)
);
create unique index if not exists mudagiri_benchmark_key on analytics.mudagiri_benchmarks(category,household,coalesce(family_profile,''),coalesce(age_band,''),coalesce(income_band,''),coalesce(prefecture,''));
