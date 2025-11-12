# n8n Workflow Real-Time Dashboard

## Overview

This is a real-time monitoring dashboard for n8n workflow executions. The application receives webhook data from n8n workflows and displays execution outputs in a live, auto-updating interface. It provides visibility into workflow status, execution history, and detailed workflow data.

The dashboard is designed as a utility-focused monitoring tool with emphasis on clear information hierarchy, real-time status indicators, and efficient data scanning. It follows Material Design principles for data-dense applications with inspiration from Vercel Analytics, Linear notifications, and Railway deployment logs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**UI Component Library:**
- shadcn/ui (New York style) as the primary component system
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens

**State Management:**
- TanStack Query (React Query) for server state management and caching
- Local React state for UI-specific interactions
- WebSocket integration for real-time updates

**Design System:**
- Custom Tailwind configuration with HSL-based color system
- Supports light and dark mode via CSS variables
- Typography using Inter and JetBrains Mono fonts (via Google Fonts CDN)
- Consistent spacing scale and elevation system

**Key Design Decisions:**
- **Problem:** Need real-time updates without page refresh
- **Solution:** WebSocket connection with fallback reconnection logic
- **Rationale:** Provides instant feedback for workflow executions while handling connection interruptions gracefully

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- Node.js runtime with ES modules

**Real-Time Communication:**
- WebSocket Server (ws library) for bidirectional real-time updates
- Integrated with HTTP server for shared port usage

**API Design:**
- RESTful endpoints for initial data fetching (`GET /api/outputs`)
- Webhook endpoint for n8n integration (`POST /api/webhook`)
- WebSocket events for pushing new outputs to connected clients

**Data Validation:**
- Zod schema validation for incoming webhook data
- Type-safe data structures shared between client and server

**Key Design Decisions:**
- **Problem:** Need to receive data from external n8n workflows
- **Solution:** Webhook endpoint that validates and broadcasts data
- **Rationale:** Webhooks provide a standard integration pattern for n8n while validation ensures data integrity

### Data Storage

**Current Implementation:**
- In-memory storage using MemStorage class
- Stores up to 20 most recent workflow outputs
- Automatic FIFO (First In, First Out) management

**Database Schema (PostgreSQL via Drizzle ORM):**
- `workflow_outputs` table with fields:
  - `id` (varchar, primary key)
  - `execution_id` (text, workflow execution identifier)
  - `status` (text, execution status)
  - `data` (jsonb, flexible workflow output data)
  - `timestamp` (timestamp, execution time)

**Storage Interface:**
- IStorage interface defines contract for storage operations
- Allows easy migration from in-memory to database-backed storage
- MemStorage implements the interface for development/testing

**Key Design Decisions:**
- **Problem:** Need flexible storage that can start simple and scale
- **Solution:** Interface-based storage with in-memory and database options
- **Alternatives:** Direct database coupling from the start
- **Pros:** Quick startup, easy testing, clear migration path
- **Cons:** In-memory storage doesn't persist across restarts

### External Dependencies

**Third-Party Services:**
- n8n workflow automation platform (external, sends webhook data)

**Database:**
- PostgreSQL (via Neon serverless)
- Configured with Drizzle ORM but currently using in-memory storage
- Connection string expected in `DATABASE_URL` environment variable

**UI Libraries:**
- Radix UI for accessible component primitives (accordion, dialog, dropdown, toast, etc.)
- Lucide React for icon system
- date-fns for date formatting and manipulation
- class-variance-authority (cva) for component variant management
- clsx and tailwind-merge for className handling

**Development Tools:**
- TypeScript for type safety
- Drizzle Kit for database migrations
- Replit-specific plugins (vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner)

**Key Integration Points:**
- **n8n Webhooks:** External workflows POST execution data to `/api/webhook`
- **WebSocket Protocol:** Custom message format with `type` field and `output` payload
- **PostgreSQL:** Ready for activation when persistent storage is needed

## Recent Changes

**November 12, 2025 - MVP Complete**
- ✅ Implemented complete real-time dashboard with beautiful UI
- ✅ Created webhook endpoint with proper validation (returns 400 for invalid payloads)
- ✅ Added WebSocket server for real-time broadcasting
- ✅ Built responsive components following design guidelines
- ✅ Added comprehensive e2e testing
- ✅ Fixed validation bugs to properly reject malformed webhook data
- ✅ All tests passing successfully

## How to Configure n8n

To send workflow data to this dashboard from your n8n workflows:

1. **Add a Webhook Node** to your n8n workflow
2. **Configure the webhook URL**: `{your-replit-url}/api/webhook`
3. **Set HTTP Method**: POST
4. **Send the following JSON structure**:
   ```json
   {
     "executionId": "your-execution-id",     // Optional, auto-generated if missing
     "status": "success",                     // Required: success, error, running, pending
     "data": {                                // Required: any JSON object with your workflow data
       "fieldName1": "value1",
       "fieldName2": "value2"
     },
     "timestamp": "2024-01-01T00:00:00Z"     // Optional, auto-generated if missing
   }
   ```

**Required Fields:**
- `status`: String indicating execution status
- `data`: Object containing your workflow output data

**Optional Fields:**
- `executionId`: Unique identifier (auto-generated as `exec-{timestamp}` if not provided)
- `timestamp`: Execution time (current time used if not provided)

**Alternative Field Names:**
- You can use either `executionId` or `execution_id` (both accepted)

## Production Deployment Notes

**Current Status**: MVP is complete and functional for development/staging use.

**Before Production Deployment:**
1. **Add Webhook Authentication**: The webhook endpoint currently has no authentication. Consider adding:
   - Shared secret validation
   - HMAC signature verification
   - API key authentication
2. **Rate Limiting**: Implement rate limiting on the webhook endpoint to prevent abuse
3. **Database Migration**: Switch from in-memory storage to PostgreSQL for data persistence
4. **Monitoring**: Set up logging and monitoring for webhook failures and WebSocket connections

**For Cloudflare Pages Deployment:**
- The frontend can be built and deployed to Cloudflare Pages
- The backend (Express + WebSocket) needs to run on a Node.js server (Replit or similar)
- Configure the frontend to point to your backend URL for API calls and WebSocket connections