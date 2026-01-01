

# ✅ Full Project TODO Roadmap (Merged & Final)

## 1. 🔑 Visitor Token System (Anonymous-First Identity)

**Goal:** Every visitor gets value instantly.

* Generate `visitorToken` on first visit
* Store token:

  * Client: `localStorage`
  * Server: DB
* Token fields:

  * `status: anonymous | claimed | expired`
  * `expiresAt = now + 7 days`
* Enforce one active token per browser
* Rate-limit token creation

---

## 2. 👤 Guest Website Persistence (Pre-Login)

**Goal:** Anonymous users are first-class citizens.

* Allow adding websites without login
* Store all websites + audits linked to `visitorToken`
* Avoid localStorage-only storage (DB is source of truth)
* Enable “continue where you left off” UX

---

## 3. 🔄 Token → User Claim Flow (Signup / Login)

**Goal:** Seamless transition from anonymous → authorized.

* On signup/login:

  * Verify `visitorToken`
  * Assign `visitorToken → userId`
  * Re-link all related data:

    * websites
    * SEO
    * SSL
    * history
* Mark token:

  * `claimed: true`
  * `expiresAt: null`
* Idempotent logic (safe retries)

---

## 4. 🧠 Unified Data Ownership Model

**Goal:** One schema. No branching logic.

```ts
owner: {
  userId?: string,
  visitorToken?: string
}
```

* Same schema for guests & logged-in users
* Status flags: `guest | claimed | active`
* Enables clean analytics and queries

---

## 5. 🧱 Database Schema Upgrade (Website Intelligence)

**Goal:** Store once. Read fast forever.

### SSL (rarely changes)

```ts
ssl: {
  issuer: string,
  subject: string,
  validFrom: Date,
  validTo: Date
}
```

### SEO (slow-changing)

```ts
seo: {
  title: string,
  titleLength: number,
  metaDescription: string,
  metaDescriptionLength: number,
  h1Count: number,
  h2Count: number,
  imageCount: number,
  imagesWithoutAlt: number,
  issues: string[],
  hasIssues: boolean
}
```

**Rule:** If it doesn’t change hourly → persist it.

---

## 6. 🧠 Smart Data Fetching (Once per Day)

**Goal:** Kill redundant processing.

* Run website analysis via cron / background job (1× daily)
* Store latest snapshot in DB
* Track `lastCheckedAt`
* Manual refresh = explicit re-run only

---

## 7. 📊 Fast Reads, Zero Recalculation

**Goal:** Dashboard = read-only & blazing fast.

* Dashboard reads only from DB
* No live scraping on page load
* SSL + SEO always fetched from stored data
* Recompute only via cron or manual trigger

---

## 8. 🚀 Dashboard Performance Optimization

**Goal:** Feels instant.

* Lazy-load heavy widgets (charts, audits, history)
* Cache user-specific dashboard data per session
* Split critical vs non-critical fetches
* Skeleton loaders > spinners

---

## 9. ⏱️ Data Retention & Cleanup (Cron)

**Goal:** Clean DB, no zombie data.

* Daily cron job:

  * Delete expired visitor tokens
  * Cascade delete (or soft delete):

    * websites
    * audits
* Optional soft delete for analytics

---

## 10. 🔐 Security & Abuse Control

**Goal:** Production-safe by default.

* Token replay protection
* Rate limits on:

  * token creation
  * website additions
* Ownership validation on every fetch

---

## 11. 🛡️ Future-Proofing (Phase 2)

**Goal:** Scale without rewrites.

* SEO audit versioning (`seoVersion`)
* Weekly historical diffs
* SSL expiry alerts
* SEO regression alerts
* Notifications & reports groundwork

---

## 🧠 Final Positioning

You’re no longer building
**“a website checker.”**

You’re building
**“a website intelligence platform.”**

Anonymous-first. Data-first. Infra that scales.
This is how serious products are built.

