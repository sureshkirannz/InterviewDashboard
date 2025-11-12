# Design Guidelines: n8n Workflow Real-Time Dashboard

## Design Approach

**Selected Approach:** Design System + Reference-Based Hybrid
- **Primary System:** Material Design principles for data-dense applications
- **Reference Inspiration:** Vercel Analytics, Linear notifications, Railway deployment logs
- **Rationale:** This is a utility-focused monitoring dashboard requiring clear information hierarchy, real-time status indicators, and efficient data scanning

## Core Design Elements

### Typography Hierarchy

**Font Family:** Inter (via Google Fonts CDN)
- Primary UI: Inter 400, 500, 600
- Monospace data: 'JetBrains Mono' for timestamps/IDs

**Type Scale:**
- Page Title: text-2xl font-semibold (Dashboard header)
- Section Headers: text-lg font-medium
- Data Labels: text-sm font-medium
- Data Values: text-base font-normal
- Timestamps: text-xs font-mono
- Status Indicators: text-xs font-medium uppercase tracking-wide

### Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component padding: p-4, p-6
- Section gaps: gap-4, gap-6
- Margins between sections: mb-6, mb-8

**Container Structure:**
- Max-width: max-w-6xl mx-auto
- Page padding: px-4 md:px-6 lg:px-8
- Vertical rhythm: py-6 for main sections

**Grid System:**
- Single column on mobile (grid-cols-1)
- Optional 2-column for large displays showing metadata (lg:grid-cols-2) if data warrants

## Component Library

### Dashboard Header
- Full-width sticky header (sticky top-0)
- Contains: App title, connection status indicator, real-time badge ("LIVE" with pulse animation)
- Height: h-16
- Layout: flex justify-between items-center

### Connection Status Indicator
- Pill shape with dot indicator
- States: Connected (green dot), Disconnected (red dot), Connecting (amber pulsing dot)
- Text: text-xs font-medium
- Spacing: gap-2 between dot and text

### Workflow Output Cards (Primary Component)
Each card represents one workflow execution:

**Card Structure:**
- Border on all sides (border rounded-lg)
- Padding: p-4 md:p-6
- Hover state: Subtle elevation change
- Stack layout: flex flex-col gap-3

**Card Content Hierarchy:**
1. **Header Row:** (flex justify-between items-start)
   - Execution ID/Number (text-sm font-mono)
   - Timestamp (text-xs text-right)
   
2. **Status Badge:** 
   - Top-left or inline with header
   - Rounded-full px-3 py-1 text-xs
   - States: Success, Error, Running, Pending

3. **Data Display Area:**
   - Key-value pairs in dl/dt/dd structure
   - Labels: text-sm font-medium
   - Values: text-base with word-break for long strings
   - Spacing: space-y-2 between pairs

4. **Expandable Details (if needed):**
   - Collapsible section for full JSON/detailed output
   - Toggle button: text-sm
   - Pre-formatted code block when expanded with max-height and scroll

### Empty State
When no data exists:
- Centered content (flex flex-col items-center justify-center)
- Icon from Heroicons (CloudArrowUpIcon, size: h-12 w-12)
- Heading: text-lg font-medium
- Description: text-sm
- Vertical spacing: gap-4

### Real-Time Updates Animation
- New entries slide in from top with subtle scale animation
- Oldest entry fades out when 21st item arrives
- Use transform + opacity transitions (transition-all duration-300)

### Loading States
- Skeleton cards while initial data loads
- 3-4 skeleton cards with animated gradient shimmer
- Same dimensions as real cards (h-32)

## Icons
**Library:** Heroicons (via CDN)
**Usage:**
- Connection status: SignalIcon
- Success: CheckCircleIcon
- Error: XCircleIcon
- Expand/Collapse: ChevronDownIcon/ChevronUpIcon
- Empty state: CloudArrowUpIcon
- Refresh: ArrowPathIcon

## Layout Patterns

### Main Dashboard Layout:
```
[Header: Title + Status] (sticky)
[Last Updated Info] (text-xs, subtle)
[Cards Container] (space-y-4, max 20 items)
  └─ [Workflow Card]
  └─ [Workflow Card]
  └─ ...
```

### Responsive Behavior:
- Mobile: Full-width cards, vertical stack, compact padding (p-4)
- Tablet/Desktop: Constrained width (max-w-6xl), generous padding (p-6)
- Cards maintain consistent width across breakpoints

## Data Presentation

### Timestamp Format
- Relative time preferred: "2 minutes ago", "Just now"
- Absolute time on hover/tap: "Jan 15, 2024 14:32:15"
- Format: text-xs with subtle styling

### JSON/Object Display
- Syntax-highlighted code blocks for raw JSON
- Collapsed by default, expandable on click
- Max height with scroll: max-h-96 overflow-y-auto
- Font: font-mono text-sm

### Auto-Scroll Behavior
- Pin to top for newest entries (default)
- Optional: "Scroll to bottom" button when user scrolls up
- Smooth scroll: scroll-smooth

## Images
**No hero images needed** - This is a functional dashboard, not a marketing page. Focus on data clarity and real-time status visualization.

## Accessibility
- All status indicators have text labels, not just colors
- Keyboard navigation for expandable sections (Enter/Space)
- ARIA labels for dynamic content updates
- Live region announcements for new workflow outputs: aria-live="polite"
- Focus management when new items appear

## Critical Implementation Notes
- Cards should feel substantial, not cramped (minimum p-4)
- Status badges must be immediately scannable (high contrast, clear labeling)
- Timestamps are crucial - always visible, never truncated
- Real-time indicator must be prominent but not distracting
- Maintain consistent card height where possible for visual rhythm
- Use subtle borders and shadows to create depth without clutter