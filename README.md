# Todo List App

A modern, premium Todo List application built with React, TypeScript, and Tailwind CSS v3.

## Features

- ✅ Add new todos with optional due dates
- ✅ Mark todos as complete/incomplete
- ✅ Edit todos inline
- ✅ Delete todos
- ✅ Filter todos (All, Active, Completed)
- ✅ Clear all completed todos
- ✅ **Calendar sidebar** - Browse and manage todos by date
- ✅ **Date-based views** - All, Today, or Scheduled
- ✅ **Due date tracking** - See overdue items highlighted
- ✅ **Auto-save** - Todos are automatically saved to localStorage
- ✅ **Export** - Export todos to JSON file for backup or sharing
- ✅ **Import** - Import todos from JSON file (merges with existing)
- ✅ Real-time progress tracking with animated progress bar
- ✅ Keyboard shortcuts (Enter to add/save, Escape to cancel edit)
- ✅ Beautiful glassmorphism design
- ✅ Animated background with floating gradients
- ✅ Smooth animations and transitions
- ✅ Premium dark theme with vibrant accents
- ✅ Todo count indicators on calendar days

## Design Highlights

### Glassmorphism UI
- Frosted glass effects on cards and containers
- Blur and transparency for depth
- Subtle borders and shadows

### Animated Background
- Floating gradient orbs with smooth animations
- Dynamic visual interest without distraction
- Creates depth and atmosphere

### Sidebar Layout
- Responsive two-column layout
- Calendar navigation
- View switching (All/Today/Scheduled)
- Statistics overview

### Calendar Integration
- Full calendar view with month navigation
- Todo count badges on each day
- Click any date to view/manage todos for that date
- Today button for quick navigation
- Visual indicators for selected date

### Premium Typography
- Large, bold heading with gradient text
- Clear hierarchy and spacing
- Readable at all sizes

### Interactive Elements
- Hover effects with scale and shadow changes
- Smooth transitions on all interactions
- Visual feedback for all actions

### Progress Tracking
- Animated progress bar
- Percentage completion display
- Real-time counters

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v3.4** - Styling with custom utilities
- **date-fns** - Date manipulation and formatting
- **Vite** - Build tool

## Getting Started

### Installation

```bash
cd /home/rg3270/blog/todo-app
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
todo-app/
├── src/
│   ├── App.tsx          # Main app component with Todo logic
│   ├── Calendar.tsx     # Calendar component for date navigation
│   ├── main.tsx         # React entry point
│   ├── index.css        # Tailwind CSS + custom utilities
│   ├── types.ts         # TypeScript type definitions
│   └── vite-env.d.ts    # Vite type declarations
├── index.html           # HTML template
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Usage

### Adding Todos
1. Type your todo in the input field
2. Press Enter or click "추가"
3. If viewing a specific date, the todo will be assigned that date
4. If viewing "All" or "Today", the todo won't have a due date

### Managing by Date
1. Click "날짜 선택" in the sidebar to enter scheduled view
2. Click any date on the calendar to view todos for that date
3. Add todos while in scheduled view to assign them to the selected date
4. Click "오늘" to see today's todos
5. Click "전체" to see all todos

### Filtering
- Use the filter tabs (전체/진행중/완료) to filter the current view
- Overdue items are highlighted with a red border
- Due dates are displayed on each todo item

## Keyboard Shortcuts

- **Enter** - Add new todo or save edited todo
- **Escape** - Cancel edit mode
- **Click** on todo text - Enter edit mode
- **Click** on calendar date - Select date and view todos

## Custom CSS Utilities

The app uses several custom utility classes defined in `index.css`:

- `.glass` - Light glassmorphism effect
- `.glass-strong` - Strong glassmorphism effect
- `.neon-glow` - Subtle neon shadow effect
- `.gradient-text` - Gradient text effect
- `.animate-float` - Floating animation
- `.animate-slide-in` - Slide in animation
- `.animate-scale-in` - Scale in animation

## License

ISC