# Changelog

All notable changes to this project will be documented in this file.

## What's Changed in v1.5.0

### ✨ New Features
- **Window Minimize** - Now you can minimize windows to taskbar
- **Smooth Animation** - Beautiful scale-down animation when minimizing
- **State Preservation** - Window content and state are preserved when minimized/restored

### 🐛 Bug Fixes
- Fixed minimize button not working
- Fixed window state resetting when restored from minimized state
- Fixed difference between minimize and close behavior

### 🏗️ Technical Improvements
- Added `minimizeWindow` and `restoreWindow` functions to useWindowManager
- Added `minimizedWindows` state for tracking
- Window component now uses `display: none` instead of DOM removal for minimizing
- Added optional `onMinimize` prop to Window component

## What's Changed in v1.4.1

### 🐛 Bug Fixes
- Fixed TypeScript error: "Property 'onContinue' is missing in type '{}'"
- MobileWarning now properly accepts optional onContinue prop

### ✨ Improvements
- Added state management for mobile warning dismissal
- Users can now dismiss mobile warning by clicking "Continue Anyway"
- Improved mobile warning UI with better instructions

## What's Changed in v1.4.0

### ✨ New Features
- **Advanced Background System** with real-time updates (no refresh needed!)
- **Solid Color Backgrounds** - choose any color with color picker
- **5 Gradient Presets** - Sunset, Ocean, Midnight, Fire, Forest
- **Reset to Default** button to restore original wallpaper
- **Live Preview** of background changes in Settings

### 🐛 Bug Fixes
- Fixed background not updating until page refresh
- Fixed background state management

### 🏗️ Technical Improvements
- Added `BackgroundContext` for centralized state management
- Added `useBackground` custom hook
- Created `BackgroundEditor` component for clean code organization

## [1.3.0] - 2026-05-07

### Fixed
- StartMenu positioning - now appears dynamically below Start button instead of fixed position
- PowerMenu positioning - now appears dynamically below Power button
- PowerMenu z-index issue - menu no longer appears behind Taskbar
- Duplicate StartMenu rendering removed from Desktop component

### Changed
- Taskbar now passes dynamic positions to both StartMenu and PowerMenu
- Added edge detection to prevent menus from going off-screen
- Improved menu positioning logic for better UX

## [1.2.0] - 2025-12-01
### Added 🚀
- **Desktop Folders:** Create, rename, and delete folders directly on the desktop.
- **File Explorer Integration:** Desktop folders now sync with File Explorer.
- **Video Player:** Play videos and view images/audio inside Nexa OS.
- **Resizable Windows:** Apps can now be resized by dragging from corners.
- **Weather & Locations:** Add custom locations (Home, Work) to view weather.
- **Timers:** Added countdown and stopwatch functionality.

### Changed ⚡
- **UI:** Improved window resizing handles and drag physics.

## [1.1.0] - 2025-11-20
### Added 🚀
- **Game Center (Arcade):** A dedicated hub for launching games.
- **New Games:** 
  - **Tic-Tac-Toe:** Features Player vs Bot (AI) and Player vs Player modes.
  - **Neon Snake:** Classic snake game with high-score tracking and neon visuals.
  - **Minesweeper:** Logic puzzle with multiple difficulty levels.
  - Added "Coming Soon" placeholder for the 2048 game.
- **Customization:** Users can now upload and set their own **Custom Wallpapers** via Settings.
- **Full Screen Mode:** Added support for browser full-screen API for an immersive OS experience.
- **About App:** Added "The Journey" tab to tell the development story.

### Changed ⚡
- **Taskbar:** Redesigned to a modern "Floating Dock" style with dynamic hover animations and tooltips.
- **Window Physics:** Improved window dragging smoothness and added "open/close" scale animations.
- **Visuals:** Enhanced Glassmorphism effects across the UI.

---

## [1.0.0] - 2025-11-15
### Added 🎉
- **Initial Release of Nexa OS.**
- **Core System:**
  - Boot Sequence & Lock Screen with password simulation.
  - Window Manager with minimize, maximize, and drag functionality.
  - Start Menu and System Tray.
- **Apps:**
  - **File Explorer:** With Virtual File System (VFS) and file upload.
  - **Agrest Browser:** Iframe-based browser simulation.
  - **Media Player:** Audio player using IndexedDB for storage.
  - **Terminal:** Functional CLI with custom commands.
  - **Notes:** Rich text note-taking app.
  - **Paint:** Canvas-based drawing tool.
  - **Mail:** Contact form simulation.