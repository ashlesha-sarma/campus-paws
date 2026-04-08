# CampusPaws
**A full-stack transparent crowdfunding and community adoption platform for campus animal welfare.**

## Overview
CampusPaws provides an end-to-end operational platform enabling student organizations to transparently crowdfund for medical drives, coordinate adoptions, and manage stray populations. Built for high conversion, it processes simulated micro-transactions seamlessly with a premium, mobile-first checkout experience.

## The Problem
Universities and local communities often struggle to manage urgent funds for injured or stray animals. Campaigns are scattered across disconnected messaging groups, leading to donor fatigue, zero transparency in fund utilization, and disorganized rescue records.

## The Solution
A centralized application that digitizes animal welfare logistics. CampusPaws combines instant unified payment checkouts, dynamic real-time goal tracking, and structured adoption pipelines into one intuitive dashboard. Donors receive immediate feedback on the precise impact of their contributions, establishing trust and driving higher conversion rates.

## Key Features
* **Processes** seamless micro-transactions via a complete Razorpay integration, supporting tier-based funding and custom monetary inputs.
* **Visualizes** real-time donation milestones through dynamic progress bars and instant social-proof data feeds.
* **Enables** administrators to securely manage multiple simultaneous welfare drives and analyze adoption metrics via a role-based dashboard.
* **Optimizes** donor conversion via a friction-free, mobile-first bottom-sheet donation modal designed for rapid checkout.

## Impact / Why It Matters
* **Drives Financial Trust:** Automates transaction recording and displays transparent, public funding milestones, eliminating manual pledge tracking.
* **Increases Conversion:** Dynamic impact labels (e.g., "₹500 covers 1 month of food") actively connect financial inputs to tangible, real-world outcomes.
* **Scales Community Action:** Consolidates chaotic social media sharing into a single source of truth, enabling secure, immediate mobilization for emergency rescues.

## Tech Stack
**Frontend:** React 18, Vite, Tailwind CSS 3  
**Backend:** Node.js, Express  
**Data & Services:** SQLite3, Razorpay APIs, Express Sessions  

## System Design
```text
Donor Selects Tier → Razorpay Order Generation API → Secure Checkout UI → HMAC Verification Webhook → SQLite DB Write → Real-time State Update
```

## Live Demo
**[Launch CampusPaws Platform →](https://campus-paws.vercel.app)**
