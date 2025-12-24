# IT Device Maintenance Tracking Dashboard

This project is an **IT device maintenance tracking dashboard** built with **TypeScript** and **React**.  
It uses **Nodemailer** to send emails via a simple **API endpoint**.

## Educational Purpose

**This project was created for educational purposes only.**  
It is intended to demonstrate concepts such as frontend development with React and TypeScript, basic API communication, and email handling using Nodemailer.  
It is **not designed for production use**.

## Purpose

The main goal of this application is to help IT department employees understand how device maintenance workflows can be modeled and managed in a dashboard-style application.

## Features

### Device Management
- Add new devices (laptop or desktop)
- Edit existing devices
- Delete devices

### Dashboard Overview
- Display devices grouped by categories
- Automatically prioritize and show **devices with upcoming maintenance dates** at the top

### One-Click Notification
- Notify the responsible maintenance team or personnel with a single button click
- Emails include detailed device information
- If the device is a **laptop**, the email also contains information about the current user of the device

## Email Functionality

- Email sending is handled via **Nodemailer**
- Emails are triggered through a dedicated API endpoint
- Designed to demonstrate notification workflows in a learning environment

## Tech Stack

- **TypeScript**
- **React**
- **Nodemailer**
- REST-style API endpoint for mail triggering

## Disclaimer

This application is a **learning project** and should not be used in real production environments without proper security hardening, authentication, authorization, and infrastructure considerations.

---

> Possible future extensions include authentication, role-based access control, automated reminders, and reporting features.
