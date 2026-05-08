# Contributing to UrduMagic 🪄

Thank you for your interest in contributing to UrduMagic! We want to make it as easy as possible for the community to help improve the Urdu web experience.

## 🚀 How to Contribute

1.  **Pick a Task**: Look at the "Pending Features" list below.
2.  **Fork & Clone**: Fork the repository and clone it locally.
3.  **Build**: Run `npm install` and `npm run build`.
4.  **Test**: Ensure existing tests pass with `npm test`.
5.  **Submit PR**: Create a branch and submit a Pull Request with a clear description.

---

## 📋 Pending Features & Roadmap (V0.3.0+)

We are looking for help with the following areas:

### 1. Dictionary Expansion (High Priority)
*   **Medical Terminology**: Add Urdu translations for common health/medical terms.
*   **Legal/Official Terms**: Help translate government and legal forms terminology.
*   **E-commerce**: Expand the dictionary for shopping, checkout, and product attribute terms.

### 2. Framework Adapters
*   **Vue.js Wrapper**: Create a `useUrduMagic` hook equivalent for Vue 3.
*   **Angular Directive**: Build a directive for easy integration in Angular apps.
*   **Svelte Action**: Implement a `use:magic` action for Svelte.

### 3. Engine Improvements
*   **Improved Transliteration**: Refine the Roman Urdu to Urdu script mapping for complex words.
*   **Sentence Boundary Detection**: Better handling of multiple sentences in a single text node.
*   **Web Workers**: Move the translation logic to a Web Worker to keep the main thread 100% smooth on low-end mobile devices.

### 4. UI/UX
*   **Themeable Switcher**: Allow developers to customize the colors and position of the floating switcher via CSS variables.
*   **Keyboard Shortcuts**: Add configurable hotkeys for switching languages (e.g., `Ctrl+Shift+U`).

---

## 🛠️ Tech Stack
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Testing**: Vitest
*   **Framework**: React (for the website/hooks)

## 📜 License
By contributing, you agree that your contributions will be licensed under the **MIT License**.
