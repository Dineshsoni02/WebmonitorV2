# 🌐 WebMonitor

**WebMonitor** is a comprehensive website monitoring solution that tracks uptime, SSL certificates, SEO health, and performance metrics. Perfect for developers, businesses, and individuals who want complete visibility into their web services.

## 🔍 Features

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

