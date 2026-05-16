# PrintFlow ERP - Project Description

PrintFlow is a lean, high-performance ERP (Enterprise Resource Planning) system specifically designed for printing shops like **Saraswathe Graphix**. It streamlines business operations from customer management to order tracking and job scheduling.

## Core Features

- **Dashboard**: Real-time overview of business performance, active orders, and revenue stats.
- **CRM (Customer Relationship Management)**: Centralized database for managing customer details, history, and communication.
- **Order Management**: End-to-end tracking of printing orders, from initial quote to final delivery.
- **Job Board (Kanban)**: Visual workflow management for the production floor, allowing staff to move jobs through different stages (Ready, Printing, Finishing, Done).
- **Settings & Backup**: Configurable system settings and automated database backups (including Supabase integration for cloud storage).

## How it Works

1.  **Order Intake**: Staff enter customer details and order specifications (quantity, size, material, etc.).
2.  **Workflow Visualization**: Orders automatically appear on the Kanban Job Board.
3.  **Production Tracking**: Staff update the status of each job in real-time as they progress through the shop.
4.  **Completion**: Once a job is marked "Done", it moves to the finished state, and customer records are updated.

## Technology Stack

### Frontend
- **Framework**: React 18+ with Vite for ultra-fast development and builds.
- **Language**: TypeScript for type-safe, robust code.
- **Styling**: Tailwind CSS for a modern, responsive utility-first design.
- **Icons**: Lucide React for a clean, consistent iconography.
- **Navigation**: React Router for seamless client-side routing.
- **State Management**: React Hooks and Context API.

### Backend
- **Framework**: FastAPI (Python) - high performance and easy to scale.
- **Database**: SQLite for local data storage with SQLAlchemy ORM.
- **Cloud Integration**: Supabase for secure cloud backups and synchronization.
- **Validation**: Pydantic for strict data validation and settings management.
- **Scheduling**: APScheduler for automated recurring tasks like backups.

### Desktop Deployment
- **Packaging**: PyInstaller with custom `.spec` configuration to bundle the entire application into a standalone Windows executable.
- **Process Management**: Custom batch scripts and VBS wrappers for a smooth, single-click startup experience.

---
*Developed for Saraswathe Graphix — 2026*
