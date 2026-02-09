-- Normalize packages JSON keys in public.listings.packages
-- Converts "Basic"/"Standard"/"Premium" (and any casing variants) to lower-case keys.
-- Safe to re-run.

-- 1) Preview rows that contain any upper-cased keys
select
  id,
  packages
from public.listings
where packages is not null
  and (
    packages ? 'Basic'
    or packages ? 'Standard'
    or packages ? 'Premium'
    or packages ? 'BASIC'
    or packages ? 'STANDARD'
    or packages ? 'PREMIUM'
  );

-- 2) Update: merge lower-case keys (prefer existing lower-case if already present)
update public.listings
set packages = (
  -- start from original jsonb
  -- remove known non-lowercase keys, then add back normalized keys
  (
    packages
      - 'Basic' - 'Standard' - 'Premium'
      - 'BASIC' - 'STANDARD' - 'PREMIUM'
  )
  || jsonb_build_object(
    'basic', coalesce(packages->'basic', packages->'Basic', packages->'BASIC'),
    'standard', coalesce(packages->'standard', packages->'Standard', packages->'STANDARD'),
    'premium', coalesce(packages->'premium', packages->'Premium', packages->'PREMIUM')
  )
)
where packages is not null
  and (
    packages ? 'Basic'
    or packages ? 'Standard'
    or packages ? 'Premium'
    or packages ? 'BASIC'
    or packages ? 'STANDARD'
    or packages ? 'PREMIUM'
  );

-- 3) Verify: there should be no remaining upper-cased keys
select
  count(*) as remaining_dirty_rows
from public.listings
where packages is not null
  and (
    packages ? 'Basic'
    or packages ? 'Standard'
    or packages ? 'Premium'
    or packages ? 'BASIC'
    or packages ? 'STANDARD'
    or packages ? 'PREMIUM'
  );
