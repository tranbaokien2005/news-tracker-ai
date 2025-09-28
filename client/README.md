# News Tracker AI – Frontend (Client)

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-FDDB21?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)

A modern, dark-themed news aggregation interface built with **React, TypeScript, and Tailwind CSS**.  
This project demonstrates a complete UI layout for a news tracking application with **AI-powered summaries**.

---

## Features

- **Dark Theme Design**: Beautiful dark mode interface with custom color palette
- **Responsive Layout**: Mobile-first design with sidebar on desktop
- **Multiple UI States**: Loading, loaded, empty, and error states
- **Interactive Components**: Article cards with AI summaries, pagination, and toast notifications
- **Mock Data**: Complete with realistic article data and status information
- **Accessibility**: Focus management, ARIA labels, and keyboard navigation
- **Modern Animations**: Smooth transitions and skeleton loading states

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

The application will be available at:
`http://localhost:5173` (Vite default port)

---

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.tsx       # Main header with topic selection
│   ├── StatusBar.tsx    # Status indicators and page info
│   ├── Sidebar.tsx      # Filters and quick stats (desktop only)
│   ├── ArticleCard.tsx  # Individual article display
│   ├── SummaryPanel.tsx # AI summary with bullets/paragraph modes
│   ├── Pagination.tsx   # Page navigation
│   ├── Toast.tsx        # Notification system
│   └── SkeletonCard.tsx # Loading state component
├── lib/
│   ├── types.ts         # TypeScript definitions
│   └── mockData.ts      # Sample articles and status data
├── pages/
│   └── Index.tsx        # Main application layout
└── index.css            # Design system and component styles
```

---

## Design System

The project uses a comprehensive design system with:

* **Color Tokens**: HSL-based dark theme colors
* **Component Classes**: Reusable `.card-article`, `.btn-primary`, etc.
* **Spacing Scale**: Consistent 8px-based spacing
* **Typography**: Semantic text styles and line clamping
* **Animations**: Smooth transitions and loading states

---

## UI States Demonstration

The app includes debug controls to showcase different states:

* **Loading**: Skeleton cards with shimmer effects
* **Loaded**: Full article grid with interactive features
* **Empty**: Clean empty state with reload options
* **Error**: Error handling with retry functionality

---

## Interactive Features

* Topic switching (Tech / Finance / World)
* Article summarization with AI-powered insights
* Bookmark and share functionality (WIP for MVP)
* Responsive pagination
* Toast notifications for user feedback
* Collapsible sidebar on desktop

---

## Technologies Used

* **React 18** with TypeScript
* **Tailwind CSS** for styling
* **Lucide React** for icons
* **Vite** for build tooling
* **Custom design system** with CSS variables

---

## Mock Data

The application includes realistic mock data featuring:

* 10 sample articles from various tech news sources
* Proper timestamps and metadata
* Sample images from Unsplash
* AI-generated summaries in bullet and paragraph formats

---

## Documentation

* [UI Spec v1 – Final](../docs/UI-Spec-v1.md)

---

## Live Demo

[View Demo on Vercel](https://your-vercel-deployment-url.vercel.app) *(add link after deployment)*

---

## Credits

Made with ❤️ by **Kien**
