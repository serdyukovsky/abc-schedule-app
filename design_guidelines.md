# Design Guidelines: ABC — Altai Business Camp

## 1. Brand Identity

**Purpose**: Professional event management app for business camp attendees to browse sessions and manage their personal agenda.

**Aesthetic Direction**: Brutally minimal productivity tool. No decorative elements, no visual noise. This is a personal assistant, not a social feed. Designed for frequent, quick checks during a multi-day event.

**Memorable Element**: Timeline-based interface with sticky time labels and a live "Now" indicator that makes the current moment always visible.

## 2. Navigation Architecture

**Root Navigation**: Tab-based (2 tabs)
- Schedule (default)
- My Schedule

**Screen List**:
1. Schedule — Browse all events with filtering
2. My Schedule — Personal agenda with conflict detection
3. Event Details — Decision-making screen (modal)

## 3. Screen-by-Screen Specifications

### Schedule Screen
**Purpose**: Browse all events and quickly decide what to attend

**Header**:
- Custom transparent header
- Left: App title "ABC" (system font, semibold)
- Right: Search icon button
- Below: Horizontal scrollable filter chips by track/theme

**Main Content**:
- Scrollable timeline list
- Events grouped by start time with sticky time labels (e.g., "09:30")
- Multiple events can appear at same time (parallel tracks)
- Thin horizontal line indicator for "Now" (when viewing current day)
- Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Event Card**:
- Title (bold, primary text)
- Speaker name (secondary text)
- Track/theme label (small, used for filtering)
- Location
- Time range (e.g., "09:30–10:30")
- Primary button: "Add to My Schedule"
- Secondary action: Star icon (save for later)
- Clean card with subtle separator line, NO shadows

**Bottom**:
- Horizontal scrollable date selector (pills showing days of event)
- Position above tab bar

### My Schedule Screen
**Purpose**: Personal agenda with conflict detection

**Header**: Same as Schedule, no search icon

**Main Content**:
- Timeline with only user-selected events
- Identical visual structure to Schedule screen
- Past events: muted/reduced opacity
- Current event: highlighted with border or background tint
- Upcoming event: visually emphasized
- Conflict warning: Red text "Conflicts with another session" below overlapping events
- Safe area insets: same as Schedule

### Event Details Screen
**Purpose**: Help user decide quickly

**Presentation**: Native modal (sheet)

**Header**:
- Default navigation header
- Left: Close button
- Right: Star icon (save/unsave)

**Main Content** (scrollable):
- Title (large, bold, clear hierarchy)
- Subtitle (if exists)
- Speaker block:
  - Circular photo placeholder
  - Name (semibold)
  - Role/company (secondary)
- Track/theme badge
- Location (with pin icon)
- Date, time, duration
- Section: "What you will get"
- Bullet list of key topics (clean typography)
- Safe area insets: top = Spacing.xl, bottom = insets.bottom + Spacing.xl + buttonHeight

**Bottom** (floating):
- Primary CTA button: "Add to My Schedule" / "Remove from My Schedule"
- Fixed to bottom with safe area + Spacing.xl

## 4. Color Palette

**Background**:
- Primary: #FFFFFF (light mode), #000000 (dark mode, system)

**Surfaces**:
- Card: #FAFAFA (light mode), #1C1C1E (dark mode)

**Text**:
- Primary: #000000 (light), #FFFFFF (dark)
- Secondary: #666666 (light), #999999 (dark)
- Muted (past events): 40% opacity

**Accent**:
- Primary action: #007AFF (system blue, used sparingly for buttons only)

**Semantic**:
- Conflict warning: #FF3B30 (system red)
- Now indicator: #34C759 (system green, thin line)
- Current event highlight: #007AFF at 10% opacity

**Borders**:
- Separator: #E5E5E5 (light), #38383A (dark)

## 5. Typography

**Font Family**: SF Pro (system font)

**Type Scale**:
- Title (screen headers): 34pt, Semibold
- Event title: 17pt, Semibold
- Speaker name: 15pt, Regular
- Time labels (sticky): 13pt, Semibold, all caps
- Body text: 15pt, Regular
- Caption (track, location): 13pt, Regular
- Button text: 17pt, Semibold

**Hierarchy Principle**: Strong contrast between title and body. Use weight (not size) for emphasis.

## 6. Assets to Generate

**Required**:
1. **icon.png** — App icon featuring "ABC" letters in clean sans-serif on solid background
2. **splash-icon.png** — Same as app icon, for launch screen
3. **empty-my-schedule.png** — Minimal illustration of empty calendar/clipboard, used on My Schedule tab when no events added

**Optional**:
4. **speaker-placeholder.png** — Neutral circular avatar for speakers without photos (geometric pattern or initials style)

**WHERE USED**:
- icon.png: Device home screen
- splash-icon.png: App launch
- empty-my-schedule.png: My Schedule tab when user hasn't added any events yet
- speaker-placeholder.png: Event Details screen, speaker block (if no photo provided)

---

**Key UX Principles**:
- One primary action per screen
- No unnecessary animations
- Fast launch and scrolling performance
- Large tap targets (minimum 44×44pt)
- Accessible UI (supports Dynamic Type, VoiceOver)
- Designed for quick, frequent checks during event