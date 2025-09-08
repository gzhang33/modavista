# Replit.md

## Overview

This is a premium wholesale garment catalog application built for ATELIER TEXTILE, a manufacturing company showcasing their clothing collections to wholesale partners. The application features a modern, elegant interface with product browsing, filtering, search capabilities, and inquiry submission functionality. Built with React and TypeScript on the frontend, Express.js on the backend, and uses Drizzle ORM for database operations with PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern component patterns
- **Vite** as the build tool and development server for fast hot module replacement
- **TailwindCSS** with shadcn/ui components for consistent, professional styling
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling
- **CSS Variables** for theming with custom color palette (charcoal, accent gold, soft whites)

### Backend Architecture
- **Express.js** REST API server with TypeScript
- **In-memory storage** with seeded sample data for development
- **Modular route structure** separating product and inquiry endpoints
- **Error handling middleware** for consistent API responses
- **Request logging** with performance metrics for API endpoints

### Database Schema Design
- **Products table**: Comprehensive garment information including specifications, images, categories, fabrics, seasons, and styles
- **Inquiries table**: Customer contact forms with support for general inquiries and sample requests
- **Drizzle ORM** with PostgreSQL dialect for type-safe database operations
- **UUID primary keys** with automatic generation
- **JSON fields** for flexible storage of product specifications and image arrays

### Component Structure
- **Page-level components**: Home page with sections for hero, categories, collections, company info, and contact
- **Feature components**: Product filtering, search, modal displays, and inquiry forms
- **UI components**: Comprehensive shadcn/ui library with custom theming
- **Responsive design** with mobile-first approach and professional typography (Playfair Display + Lato)

### State Management
- **Local component state** for UI interactions (modals, filters, search)
- **Server state caching** via TanStack Query with optimistic updates
- **Form state** managed by React Hook Form with schema validation
- **Toast notifications** for user feedback on actions

## External Dependencies

### Core Framework Dependencies
- **React ecosystem**: React 18, React DOM, TypeScript support
- **Build tools**: Vite with TypeScript and React plugins
- **Styling**: TailwindCSS with PostCSS and Autoprefixer

### UI Component Library
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives for dialogs, forms, navigation
- **Lucide React**: Modern icon library for consistent iconography
- **Class Variance Authority**: Component variant management

### Database and Backend
- **Drizzle ORM**: Type-safe PostgreSQL ORM with migrations
- **@neondatabase/serverless**: PostgreSQL client for serverless environments
- **Express.js**: Web framework with middleware support
- **Zod**: Schema validation for forms and API requests

### Development and Deployment
- **Replit integration**: Development environment with cartographer and error overlay
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx + tailwind-merge**: Conditional CSS class management
- **nanoid**: Unique ID generation
- **wouter**: Lightweight routing solution

The application is designed for professional wholesale catalog browsing with emphasis on visual appeal, filtering capabilities, and lead generation through inquiry forms.