# API Documentation

## Overview

This document provides comprehensive documentation for the application's API endpoints, with a focus on the committee filtering functionality and related features.

## 🔧 **Base Configuration**

### Authentication
- **Type**: Firebase ID Token (Bearer)
- **Header**: `Authorization: Bearer <firebase_token>`
- **Validation**: Automatic token verification in middleware

### Content Types
- **Request**: `application/json`
- **Response**: `application/json`
- **File Uploads**: `multipart/form-data`

### Error Response Format
```json
{
  "error": "Error message description",
  "details": "Optional detailed error information"
}
```

---

## 🏛️ **Committee API Endpoints**

### GET /api/v1/committees

Retrieves all available committees for filtering dropdown options.

#### Query Parameters
- `includeCounts` (optional): Include event counts per committee
  - Type: `boolean`
  - Default: `false`
  - Example: `?includeCounts=true`
- `includeTestData` (optional): Include test data (debug mode)
  - Type: `boolean`
  - Default: `false`
  - Example: `?includeTestData=true`

#### Response Format
```json
[
  {
    "id": "uuid-string",
    "name": "NECYPAA",
    "slug": "necypaa",
    "lastSeen": "2024-01-15T10:30:00.000Z",
    "eventCount": 15
  },
  {
    "id": "uuid-string",
    "name": "MSCYPAA",
    "slug": "mscypaa",
    "lastSeen": "2024-01-14T16:45:00.000Z",
    "eventCount": 12
  }
]
```

#### Response Fields
- `id`: Unique committee identifier (UUID)
- `name`: Committee name in ALL CAPS format
- `slug`: URL-friendly identifier for filtering
- `lastSeen`: ISO timestamp of last committee appearance
- `eventCount`: Number of upcoming events (only when `includeCounts=true`)

#### Example Requests
```bash
# Get all committees
GET /api/v1/committees

# Get committees with event counts
GET /api/v1/committees?includeCounts=true

# Include test data (debug mode)
GET /api/v1/committees?includeTestData=true&includeCounts=true
```

---

### POST /api/v1/committees/sync

Synchronizes committees collection with new entries from events data.

#### Request Body
```json
{
  // No request body required - syncs from existing events
}
```

#### Response Format
```json
{
  "success": true,
  "results": {
    "processed": 25,
    "inserted": 3,
    "updated": 22,
    "skipped": 0
  },
  "totalCommittees": 17
}
```

#### Response Fields
- `success`: Boolean indicating sync completion
- `results.processed`: Total committee entries processed
- `results.inserted`: Number of new committees added
- `results.updated`: Number of existing committees updated
- `results.skipped`: Number of invalid entries skipped
- `totalCommittees`: Total committees in database after sync

#### Sync Algorithm
1. **Query Events**: Extracts unique committee/committee_slug combinations
2. **Normalize Names**: Converts to ALL CAPS and removes leading "THE"
3. **Validate Patterns**: Ensures only regional, advisory, and BID formats
4. **Generate Slugs**: Creates URL-friendly identifiers
5. **Deduplicate**: Prevents duplicate committee entries
6. **Update Database**: Inserts new committees and updates existing ones

#### Validation Rules
```typescript
// Regional committees: NECYPAA, MSCYPAA, RISCYPAA, NHSCYPAA
const REGIONAL_PATTERN = /^[A-Z]+YPAA$/;

// Advisory committees: NECYPAA ADVISORY, MSCYPAA ADVISORY
const ADVISORY_PATTERN = /^[A-Z]+YPAA ADVISORY$/;

// BID committees: RHODE ISLAND BID FOR NECYPAA
const BID_PATTERN = /^[A-Z\s]+BID FOR Y?PAA$/;
```

---

## 📅 **Enhanced Event Endpoints**

All event endpoints now support committee filtering alongside existing parameters.

### GET /api/v1/events

Retrieves events with optional committee filtering.

#### Query Parameters
- `committee` (optional): Single committee slug for filtering
  - Type: `string`
  - Example: `?committee=necypaa`
- `committees` (optional): Multiple committee slugs (can be repeated)
  - Type: `string[]`
  - Example: `?committees=necypaa&committees=mscypaa`
- `range` (optional): Number of days to look ahead
  - Type: `number`
  - Default: `90`
  - Example: `?range=30`
- `includeTestData` (optional): Include test data
  - Type: `boolean`
  - Default: `false`
  - Example: `?includeTestData=true`

#### Example Requests
```bash
# Get all events
GET /api/v1/events

# Filter by single committee
GET /api/v1/events?committee=necypaa

# Filter by multiple committees
GET /api/v1/events?committees=necypaa&committees=mscypaa

# Filter with date range
GET /api/v1/events?committees=necypaa&range=30

# Include test data
GET /api/v1/events?includeTestData=true
```

---

### GET /api/v1/browse

Retrieves merged events and occurrences with location and committee filtering.

#### Query Parameters
- `committees` (optional): Committee slugs for filtering
  - Type: `string[]`
  - Example: `?committees=necypaa&committees=mscypaa`
- `lat` (optional): Latitude for location filtering
  - Type: `number`
  - Example: `?lat=42.3601`
- `lng` (optional): Longitude for location filtering
  - Type: `number`
  - Example: `?lng=-71.0589`
- `radius` (optional): Search radius in kilometers
  - Type: `number`
  - Example: `?radius=50`
- `range` (optional): Days ahead to search
  - Type: `number`
  - Default: `90`
  - Example: `?range=30`

#### Response Format
```json
[
  {
    "id": "uuid-string",
    "name": "NECYPAA Monthly Meeting",
    "startsAtUtc": "2024-02-15T19:00:00.000Z",
    "endsAtUtc": "2024-02-15T21:00:00.000Z",
    "latitude": 42.3601,
    "longitude": -71.0589,
    "committee": "NECYPAA",
    "committeeSlug": "necypaa",
    "eventType": "Committee Meeting",
    "itemType": "event",
    "distanceMeters": 1250.5
  }
]
```

#### Example Requests
```bash
# Browse all events
GET /api/v1/browse

# Browse with committee filter
GET /api/v1/browse?committees=necypaa

# Browse with location filter
GET /api/v1/browse?lat=42.3601&lng=-71.0589&radius=50

# Combined filters
GET /api/v1/browse?committees=necypaa&lat=42.3601&lng=-71.0589&radius=50
```

---

### GET /api/v1/occurrences

Retrieves event occurrences with committee filtering.

#### Query Parameters
- `committees` (optional): Committee slugs for filtering
  - Type: `string[]`
  - Example: `?committees=necypaa&committees=mscypaa`
- `includeTestData` (optional): Include test data
  - Type: `boolean`
  - Default: `false`

#### Example Requests
```bash
# Get all occurrences
GET /api/v1/occurrences

# Filter by committees
GET /api/v1/occurrences?committees=necypaa

# Include test data
GET /api/v1/occurrences?includeTestData=true
```

---

## 📝 **Event Creation with Committee Validation**

### POST /api/v1/events

Creates new events with committee name validation and normalization.

#### Committee Validation
All committee names are automatically validated and normalized during event creation:

```typescript
// Input validation and normalization
const validation = CommitteeValidator.validateCommitteeName(inputCommittee);
if (!validation.isValid) {
  throw new Error(validation.error || 'Invalid committee name');
}
const normalizedCommittee = validation.normalizedName;
```

#### Supported Event Types
- `single`: Single occurrence events
- `ypaa-weekly`: Weekly YPAA meeting series
- `committee-monthly`: Monthly committee meeting series
- `conference`: Multi-day conferences

#### Committee Requirements by Event Type
```typescript
// Single events - committee optional
{
  eventMode: 'single',
  committee: 'NECYPAA' // Optional
}

// YPAA weekly meetings - committee optional
{
  eventMode: 'ypaa-weekly',
  committee: 'NECYPAA' // Optional
}

// Committee monthly meetings - committee recommended
{
  eventMode: 'committee-monthly',
  committee: 'NECYPAA' // Recommended
}

// Conferences - committee optional
{
  eventMode: 'conference',
  committee: 'NECYPAA' // Optional
}
```

#### Validation Examples
```typescript
// ✅ Valid committee names
"NECYPAA" → "NECYPAA"
"necypaa" → "NECYPAA"
"THE RHODE ISLAND BID FOR NECYPAA" → "RHODE ISLAND BID FOR NECYPAA"

// ❌ Invalid committee names
"NECYPAA EXECUTIVE" → Error: "Committee names cannot contain 'EXECUTIVE'"
"THE NEW HAMPSHIRE CONFERENCE" → Error: "Committee names should be short"
```

---

## 🗂️ **Committee Name Validation API**

### Validation Patterns

The API enforces strict committee name validation patterns:

#### Regional Committees
```regex
/^[A-Z]+YPAA$/
```
**Examples:**
- `NECYPAA`
- `MSCYPAA`
- `RISCYPAA`
- `NHSCYPAA`
- `CSCYPAA`
- `MECYPAA`
- `VTCYPAA`

#### Advisory Committees
```regex
/^[A-Z]+YPAA ADVISORY$/
```
**Examples:**
- `NECYPAA ADVISORY`
- `MSCYPAA ADVISORY`
- `RISCYPAA ADVISORY`
- `NHSCYPAA ADVISORY`

#### BID Committees
```regex
/^[A-Z\s]+BID FOR Y?PAA$/
```
**Examples:**
- `RHODE ISLAND BID FOR NECYPAA`
- `MASSACHUSETTS BID FOR MSCYPAA`
- `CONNECTICUT BID FOR CSCYPAA`
- `NEW HAMPSHIRE BID FOR NHSCYPAA`
- `MAINE BID FOR MECYPAA`

### Normalization Rules

1. **ALL CAPS Conversion**: All committee names converted to uppercase
2. **Leading "THE" Removal**: Removed from BID committee names for deduplication
3. **Whitespace Trimming**: Leading and trailing whitespace removed
4. **Slug Generation**: URL-friendly slugs generated from normalized names

---

## 🔧 **Database Schema**

### Committees Table
```sql
CREATE TABLE app.committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- Normalized to ALL CAPS
  slug TEXT NOT NULL UNIQUE,       -- URL-friendly identifier
  test_data BOOLEAN DEFAULT false, -- Test data flag
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX committees_slug_idx ON app.committees(slug);
CREATE INDEX committees_name_idx ON app.committees(name);
CREATE INDEX committees_test_data_idx ON app.committees(test_data);
```

### Events Table (Enhanced)
```sql
-- Existing fields plus committee filtering support
ALTER TABLE app.events ADD COLUMN IF NOT EXISTS committee TEXT;
ALTER TABLE app.events ADD COLUMN IF NOT EXISTS committee_slug TEXT;

-- Performance indexes for committee filtering
CREATE INDEX IF NOT EXISTS events_committee_slug_idx ON app.events(committee_slug);
```

---

## 🧪 **Debug and Testing**

### Debug Mode
Enable debug mode to include test data in API responses:

```typescript
// Automatically includes test data when debug mode is ON
const includeTestData = debugSettings.isDebugModeEnabled();

// Manual override
GET /api/v1/committees?includeTestData=true
GET /api/v1/events?includeTestData=true
```

### Test Data Management
```sql
-- Mark all data as test data
UPDATE app.committees SET test_data = true;
UPDATE app.events SET test_data = true;

-- Production queries exclude test data
SELECT * FROM app.committees WHERE test_data = false;
SELECT * FROM app.events WHERE test_data = false;
```

### Available Test Committees (17 total)
```sql
-- Regional (7)
'NECYPAA', 'MSCYPAA', 'RISCYPAA', 'NHSCYPAA',
'CSCYPAA', 'MECYPAA', 'VTCYPAA'

-- Advisory (5)
'NECYPAA ADVISORY', 'MSCYPAA ADVISORY', 'RISCYPAA ADVISORY',
'NHSCYPAA ADVISORY', 'CSCYPAA ADVISORY'

-- BID (5)
'RHODE ISLAND BID FOR NECYPAA',
'MASSACHUSETTS BID FOR MSCYPAA',
'CONNECTICUT BID FOR CSCYPAA',
'NEW HAMPSHIRE BID FOR NHSCYPAA',
'MAINE BID FOR MECYPAA'
```

---

## 📊 **Performance Considerations**

### Query Optimization
- **Database Indexes**: Optimized for slug, name, and committee filtering
- **Query Caching**: Committee data cached in memory
- **Efficient Filtering**: Direct slug-based filtering avoids complex joins
- **Pagination Ready**: Supports large result sets with efficient pagination

### API Response Times
- **Committee List**: < 100ms (cached)
- **Events with Committee Filter**: < 200ms
- **Browse with Multiple Filters**: < 300ms
- **Committee Sync**: < 500ms (batch operation)

### Rate Limiting
- **Committee Sync**: Limited to prevent abuse
- **Event Creation**: Standard rate limiting applies
- **Filtering**: No additional rate limiting for read operations

---

## 🚨 **Error Handling**

### Committee Validation Errors
```json
{
  "error": "Invalid committee name",
  "details": {
    "field": "committee",
    "value": "NECYPAA EXECUTIVE",
    "suggestions": ["NECYPAA", "MSCYPAA", "RISCYPAA"]
  }
}
```

### API Errors
```json
{
  "error": "Failed to fetch committees",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Database Errors
```json
{
  "error": "Database connection failed",
  "details": "Connection timeout"
}
```

---

## 🔄 **Migration and Updates**

### Committee Data Migration
```sql
-- Migrate existing committee data
INSERT INTO app.committees (name, slug, test_data)
SELECT DISTINCT
  UPPER(TRIM(committee)) as name,
  LOWER(REPLACE(REPLACE(UPPER(TRIM(committee)), ' ', '-'), '.', '')) as slug,
  false as test_data
FROM app.events
WHERE committee IS NOT NULL
  AND committee != ''
  AND test_data = false;
```

### Schema Updates
```sql
-- Add committee fields to events table
ALTER TABLE app.events ADD COLUMN IF NOT EXISTS committee TEXT;
ALTER TABLE app.events ADD COLUMN IF NOT EXISTS committee_slug TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS events_committee_slug_idx ON app.events(committee_slug);
```

---

*For additional API endpoints and general application documentation, refer to the main README.md file.*
