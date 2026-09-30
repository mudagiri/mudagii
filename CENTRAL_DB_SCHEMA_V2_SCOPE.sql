-- MUDAGIRI V4 scope-safe analytics migration.
-- Apply after CENTRAL_DB_SCHEMA_V1.sql.

alter table analytics.diagnoses add column if not exists diagnosis_scope text;
alter table analytics.diagnoses add column if not exists household_size integer;
alter table analytics.diagnoses add column if not exists adult_count integer;
alter table analytics.diagnoses add column if not exists child_count integer;
alter table analytics.diagnoses add column if not exists housing_tenure text;
alter table analytics.diagnoses add column if not exists housing_subtype text;
alter table analytics.diagnoses alter column monthly_take_home_income drop not null;

alter table analytics.diagnosis_categories add column if not exists diagnosis_amount numeric;
alter table analytics.diagnosis_categories add column if not exists personal_burden numeric;
alter table analytics.diagnosis_categories add column if not exists household_total numeric;
alter table analytics.diagnosis_categories add column if not exists comparison_amount numeric;
alter table analytics.diagnosis_categories add column if not exists comparison_amount_scope text;
alter table analytics.diagnosis_categories add column if not exists comparison_benchmark numeric;
alter table analytics.diagnosis_categories add column if not exists comparison_quality text;
alter table analytics.diagnosis_categories add column if not exists comparison_source_version text;
alter table analytics.diagnosis_categories add column if not exists benchmark_eligible boolean not null default false;
alter table analytics.diagnosis_categories add column if not exists confirmed_saving numeric not null default 0;

-- Never mix personal burden with household totals in the same benchmark population.
-- Only the explicitly scope-matched comparison_amount is eligible.
drop materialized view if exists analytics.mudagiri_benchmarks_v2;
create materialized view analytics.mudagiri_benchmarks_v2 as
select
 c.category,
 c.comparison_amount_scope as amount_scope,
 d.household_size,
 case when c.comparison_amount_scope='personal' then d.age_band else null end as age_band,
 d.income_band,
 d.prefecture,
 count(*)::int n,
 round(avg(c.comparison_amount)) mean,
 round(percentile_cont(.25) within group(order by c.comparison_amount)) p25,
 round(percentile_cont(.50) within group(order by c.comparison_amount)) median,
 round(percentile_cont(.75) within group(order by c.comparison_amount)) p75,
 round(percentile_cont(.90) within group(order by c.comparison_amount)) p90,
 round(stddev_pop(c.comparison_amount)) stddev,
 now() updated_at
from analytics.latest_benchmark_diagnoses d
join analytics.diagnosis_categories c using(diagnosis_id)
where
 c.benchmark_eligible=true
 and c.comparison_amount is not null
 and c.comparison_quality in ('exact','reference')
group by
 c.category,
 c.comparison_amount_scope,
 d.household_size,
 case when c.comparison_amount_scope='personal' then d.age_band else null end,
 d.income_band,
 d.prefecture;

create unique index if not exists mudagiri_benchmarks_v2_key
on analytics.mudagiri_benchmarks_v2(
 category,
 amount_scope,
 coalesce(household_size,-1),
 coalesce(age_band,''),
 coalesce(income_band,''),
 coalesce(prefecture,'')
);
