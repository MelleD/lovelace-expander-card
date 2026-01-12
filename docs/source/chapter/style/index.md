# Styling

 From basic color changes to advanced CSS animations and transitions, the Expander Card provides comprehensive styling options to match your dashboard design perfectly.

The Expander Card offers multiple approaches to styling, giving you full control over every visual aspect of the card. Whether you're making simple adjustments or creating complex animated effects, you'll find the tools you need here.

## Style Overview

The Expander Card provides a powerful `style` configuration parameter that allows you to apply custom CSS to various elements of the card. This includes the card container, header, title, arrow, children wrapper, and more.

Key styling features:

- **Element-Specific Styling**: Target individual components like headers, titles, and arrows
- **State-Based Styling**: Apply different styles based on expanded/collapsed states
- **Animation Support**: Create smooth transitions and animated effects during expansion
- **Title Card Integration**: Style title cards with or without overlays
- **CSS Variables**: Use and override built-in CSS variables for consistent theming
- **Flexible Selectors**: Use CSS classes for precise control over styling

The styling system is designed to work seamlessly with Home Assistant's theming system while providing the flexibility to create unique, custom designs.

For comprehensive information on available CSS classes, state classes, animation classes, and styling examples, visit the [Advanced Styling Guide](style.md).

## Practical Examples

Learning by example is often the best approach to styling. Our examples section provides a curated collection of ready-to-use styling snippets that demonstrate various techniques and effects.
You can copy these examples directly into your configuration and adapt them to your needs.

Explore the [YAML Styling Examples](examples/yaml-styling-examples.md) to see what's possible and get inspired for your own custom designs.

## Hover Effects

The Expander Card uses Home Assistant's built-in ripple element (`ha-ripple`) for interactive feedback on button presses and hover states.

For detailed information on CSS variables, configuration classes, and hover customization examples, see the [Hover Styling Guide](hover.md).

## Card-Mod

Before the `style` attribute was introduced, [card-mod](https://github.com/thomasloven/lovelace-card-mod) was the primary method for styling expander cards. While card-mod still works with the Expander Card, it is strongly recommended to migrate to the native `style` attribute for better performance and maintainability.

If you're currently using card-mod, migrating to the `style` attribute is usually as simple as moving your CSS from the card-mod configuration to the `style` parameter.

For more information and migration notes, see the [Card-Mod Information](card-mod.md).