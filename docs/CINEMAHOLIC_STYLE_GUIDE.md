# Cinemaholic Design System & Style Guide

Welcome to the **Cinemaholic** design philosophy. This guide documents the visual identity, tokens, and interaction patterns used to create the premium "CinemaDNA" experience.

---

## 🎭 Visual Thesis
Cinemaholic is about **dramatic intimacy**. It treats every movie as a high-stakes discovery. The aesthetic draws inspiration from modern luxury cinemas (velvet textures, gold leaf) and high-end film production interfaces (precision metrics, tactical metadata).

- **Drama**: High contrast, spotlight gradients, and deep shadows.
- **Tactility**: Glassmorphism, subtle film grain, and 3D tilt effects.
- **Elegance**: Serif typography paired with precision sans-serif.

---

## 🎨 Color Palette
Mapped to `styles/palette.css`.

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--palette-charcoal` | `#050508` | Primary background (Deep void) |
| `--palette-midnight` | `#0f1724` | Surface cards |
| `--palette-gold` | `#E6B91E` | Primary accent (Rewards/IMDb) |
| `--palette-copper` | `#b86b3e` | Secondary accent (Comfort) |
| `--palette-velvet` | `#7a0f1c` | Alert/Highlight (High Risk/Archetype) |
| `--cin-glass` | `rgba(255,...)`| Surface borders and separation |

---

## 🖋️ Typography
- **Headings**: `Playfair Display` (Serif, 700-900 weight). Used for titles and dramatic section headers.
- **Body**: `Inter` (Sans-serif). Used for plot texts, metadata, and controls to ensure maximum legibility.

---

## ✨ Components

### 1. The Poster Card
- **Aspect Ratio**: 2:3 (Tall)
- **Overlay**: Gradient from transparent to solid black at bottom.
- **Interaction**: 3D tilt on hover + subtle scale up.
- **Metadata**: Floating gold/velvet badges for "Gem Score" or "Risk".

### 2. The Spotlight Modal
- **Layout**: 2-column (Poster left, Content right).
- **Background**: `80%` opacity charcoal with backdrop-blur.
- **Animation**: Staggered reveal of plot -> metrics -> controls.

---

## 🎬 Motion System
Governed by `styles/animations.css` and `ui/animations.js`.

- **Transition**: `cubic-bezier(.2, .9, .2, 1)` (The "Snappy Cinematic" curve).
- **Staggers**: 100ms offset for list items.
- **Micro-interactions**: High-velocity ripple effect on buttons.

---

## ♿ Accessibility
- **Reduced Motion**: All GSAP and CSS animations transition to 0ms or simple opacity fades when `prefers-reduced-motion` is detected.
- **Focus States**: High-contrast gold rings for all keyboard navigation.
- **Focus Trap**: Implemented on all modals to prevent background interaction.

---

## 🎞️ Assets
- **Film Grain**: `assets/patterns/film-grain.png` (Subtle 50x50 noise tile).
- **Spotlight Gradient**: CSS radial-gradients used for the "Hero" and "Decision" modals.
