-- Clear Test Data SQL Script
-- Run this in your PostgreSQL database

-- Option 1: Clear only test events (safest)
DELETE FROM app.events
WHERE status = 'approved'
AND name IN (
  'NECYPAA Committee Meeting',
  'NECYPAA 35',
  'MSCYPAA 26',
  'NECYPAA Fall Festival',
  'RYAA Spring Dance',
  'CSCYPAA Committee Meeting',
  'Maine YPAA Workshop',
  'Vermont YPAA Dance',
  'Rhode Island YPAA Meeting'
);

-- Option 2: Clear ALL events (if you want to start fresh)
-- DELETE FROM app.events WHERE status = 'approved';

-- Option 3: Clear everything (nuclear option)
-- DELETE FROM app.flags;
-- DELETE FROM app.ratelimits;
-- DELETE FROM app.occurrences;
-- DELETE FROM app.conferences;
-- DELETE FROM app.events;
-- DELETE FROM app.series;
-- DELETE FROM app.users;

-- Check what's left
SELECT COUNT(*) as events_count FROM app.events;
SELECT COUNT(*) as conferences_count FROM app.conferences;
SELECT COUNT(*) as occurrences_count FROM app.occurrences;
