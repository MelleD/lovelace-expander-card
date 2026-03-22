---
applyTo: '**/*.svelte,**/*.ts,**/*.js'
---

# Svelte & Lovelace Expander Card Instructions for Copilot Reviewer

## Project Context
This is a Home Assistant Lovelace Custom Card (lovelace-expander-card). It adds expandable UI elements to HA dashboards. Use Lit-like HA conventions combined with Svelte 5 Runes for reactive components.

## Code Style & Best Practices
- Use Svelte 5 Runes ($state, $derived, $effect) for all reactive state—no legacy Svelte 4 stores.
- Keep components small and composable; max 200 lines per .svelte file.
- Use TypeScript everywhere: Define interfaces for props like `cardConfig: LovelaceCardConfig`.
- Format with Prettier + svelte-prettier-plugin: No indentation inside <script> and <style> tags.
- Avoid DOM manipulation; use Svelte transitions and actions.

## Home Assistant Integration
- Type props as `HassEntity` or `LovelaceCardConfig`.
- Use `ha-card`, `ha-icon`, `ha-switch` from HA components—import via `home-assistant-frontend`.
- Update states reactively with `hass.states[entity_id]` via $derived.
- Support YAML config: Validate `config.expanded` as boolean.
- No global state; keep everything local per card.

## Performance & Accessibility
- Memoize expensive computations with $derived.
- Avoid unnecessary re-renders: Use `| $` for runes in templates.
- Add ARIA attributes: `aria-expanded`, `role="button/region"`.
- Lazy-load icons and styles only when needed.

## Security & HA Standards
- Validate all config user inputs (sanitize HTML if needed).
- No eval() or innerHTML without DOMPurify.
- Handle `hass.user.is_admin` for advanced features.

## Review Style
- Be concrete and actionable: Suggest code fixes with examples.
- Prioritize: 1. Bugs, 2. Performance, 3. Style.
