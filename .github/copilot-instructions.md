---
applyTo: '**/*.svelte,**/*.ts,**/*.js'
---

# Svelte & Lovelace Expander Card Instructions for Copilot Reviewer

## Project Context
This is a Home Assistant Lovelace Custom Card (lovelace-expander-card). It adds expandable UI elements to HA dashboards. Use Lit-like HA conventions combined with Svelte 5 Runes for reactive components.

## Code Style & Best Practices
- Use Svelte 5 Runes ($state, $derived, $effect) for all reactive state—no legacy Svelte 4 stores.
- Keep components small and composable; prefer <200 lines per .svelte file when practical.
- Use TypeScript everywhere: Define interfaces for props like `cardConfig: LovelaceCardConfig`.
- Format with Prettier + prettier-plugin-svelte: No indentation inside <script> and <style> tags.
- Avoid manual DOM manipulation in Svelte components; prefer Svelte transitions and actions. When DOM access is required for Home Assistant web component interop (e.g., `hui-card`), use it sparingly, document/justify it in comments, and keep the logic minimal.

## Home Assistant Integration
- Type props using real HA types such as `HomeAssistant` and `LovelaceCardConfig`.
- Use `ha-card`, `ha-icon`, `ha-switch` as Home Assistant web components provided at runtime (no `home-assistant-frontend` import in this project).
- Update states reactively with `hass.states[entity_id]` via $derived.
- Support YAML config: Validate `config.expanded` as boolean.
- No global state; keep everything local per card.

## Performance & Accessibility
- Memoize expensive computations with $derived.
- Avoid unnecessary re-renders: Keep runes in `<script>` (`$state`, `$derived`, `$effect`) and reference the resulting values directly in markup.
- Add ARIA attributes: `aria-expanded`, `role="button/region"`.
- Lazy-load icons and styles only when needed.

## Security & HA Standards
- Validate all config user inputs (sanitize HTML if needed).
- Avoid `eval()` and avoid `innerHTML`/Svelte `{@html}` wherever possible; if rendering HTML is unavoidable, add DOMPurify as a dependency and sanitize all HTML before use.
- Handle `hass.user.is_admin` for advanced features.

## Review Style
- Be concrete and actionable: Suggest code fixes with examples.
- Prioritize: 1. Bugs, 2. Performance, 3. Style.
