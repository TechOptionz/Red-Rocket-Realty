-- Every-minute feed check, scheduled by Supabase (pg_cron + pg_net) because Vercel Hobby only allows daily crons.
-- Calls the site's /api/feed/sync with the CRON_SECRET, exactly like Vercel Cron would. vercel.json keeps a daily run as a backup.
--
-- Before running: replace the two placeholders below.
--   __SITE_URL__     your live address, e.g. https://redrocketrealty.com.au   (no trailing slash)
--   __CRON_SECRET__  the CRON_SECRET value set in Vercel
-- Then paste into Supabase → SQL Editor → Run. Safe to re-run (replaces the secret and the job).
-- Do not commit a filled-in copy of this file.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Keep the secret in Supabase Vault (encrypted) rather than in the job text.
do $$
declare existing uuid;
begin
  select id into existing from vault.secrets where name = 'feed_cron_secret';
  if existing is null then
    perform vault.create_secret('__CRON_SECRET__', 'feed_cron_secret', 'Bearer token for /api/feed/sync');
  else
    perform vault.update_secret(existing, '__CRON_SECRET__');
  end if;
end $$;

select cron.unschedule(jobid) from cron.job where jobname = 'feed-sync';

select cron.schedule(
  'feed-sync',
  '* * * * *',
  $job$
  select net.http_get(
    url := '__SITE_URL__/api/feed/sync',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'feed_cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $job$
);

-- Check it's working (after a couple of minutes):
--   select status, return_message, start_time from cron.job_run_details order by start_time desc limit 5;
--   select status_code, left(content, 200), created from net._http_response order by created desc limit 5;
-- Stop it:
--   select cron.unschedule('feed-sync');
