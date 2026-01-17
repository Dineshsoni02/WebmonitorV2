# 🌐 WebMonitor

🔗 **Live Demo:** [https://webmonitor-v2.vercel.app](https://webmonitor-v2.vercel.app)

**WebMonitor** is a comprehensive website monitoring solution that tracks uptime, SSL certificates, SEO health, and performance metrics. Perfect for developers, businesses, and individuals who want complete visibility into their web services.

## � Why I Built This

As a developer managing multiple websites and projects, I faced several recurring pain points:

* **Unexpected Downtime** - Finding out my site was down only after users complained
* **SSL Certificate Expiry** - Certificates expiring without warning, causing security errors
* **SEO Blind Spots** - Not knowing about missing meta tags or broken heading structures until rankings dropped
* **Manual Checking** - Wasting time manually visiting each site to verify it's working

I wanted a single dashboard where I could see the health of all my websites at a glance—without paying for expensive monitoring services.

## 🎯 Problems This Solves

| Problem | Solution |
|---------|----------|
| "Is my site down right now?" | Real-time uptime status with response time metrics |
| "When does my SSL expire?" | SSL monitoring with days-remaining countdown |
| "Is my SEO configured correctly?" | Automated SEO analysis detecting common issues |
| "I missed knowing my site was down" | Email notifications when sites go offline |
| "I want to try before signing up" | Anonymous guest access with visitor tokens |

## �🔍 Features

### Core Monitoring
* ✅ **Uptime Tracking** - Real-time up/down status monitoring for any public website
* ⚡ **Response Time** - Measure and track website response times
* 🔄 **Automated Daily Checks** - Scheduled cron job checks all websites at 9 AM daily

### SSL Certificate Monitoring
* � **SSL Validation** - Verify if SSL certificates are valid and properly configured
* 📅 **Expiry Tracking** - Monitor SSL certificate expiration dates
* ⏰ **Days Remaining** - See how many days until certificate expires
* 🏢 **Issuer Information** - View certificate issuer details

### SEO Health Analysis
* � **Title Tag Analysis** - Check page titles and character length
* � **Meta Description** - Analyze meta descriptions for SEO optimization
* 🏷️ **Heading Structure** - Count H1 and H2 tags for proper hierarchy
* 🖼️ **Image Alt Tags** - Detect images missing alt text
* ⚠️ **SEO Issues** - Automated detection of common SEO problems

### User Features
* 📊 **Dashboard View** - Clean, modern interface with all metrics at a glance
* 🔔 **Email Notifications** - Get alerted when your websites go down
* 🕵️ **Anonymous Access** - Try without registration (visitor token system)
* 👤 **User Accounts** - Register to save websites & receive notifications
* 🔄 **Cross-tab Sync** - Session sync across browser tabs/windows

## 🛠 Tech Stack

### Frontend
* [React 19](https://reactjs.org/) - UI library
* [Vite 7](https://vitejs.dev/) - Build tool
* [Tailwind CSS 4](https://tailwindcss.com/) - Styling

### Backend
* [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) - Server
* [MongoDB](https://mongodb.com/) + [Mongoose](https://mongoosejs.com/) - Database
* [node-cron](https://www.npmjs.com/package/node-cron) - Scheduled tasks
* [Nodemailer](https://nodemailer.com/) - Email notifications
* [JWT](https://jwt.io/) - Authentication

