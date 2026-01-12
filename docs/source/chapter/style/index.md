# Styling

Welcome to the styling section of the Expander Card! This section covers everything you need to know about customizing the visual appearance of your expander cards. From basic color changes to advanced CSS animations and transitions, the Expander Card provides comprehensive styling options to match your dashboard design perfectly.

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

Example categories include:

- **Background Transitions**: Animate background colors during expansion/collapse
- **Layout Modifications**: Reposition elements like moving arrows to different sides
- **Title Styling**: Change fonts, sizes, and colors dynamically
- **Overlay Adjustments**: Customize title card overlay heights and appearances
- **State-Dependent Styles**: Apply different styles based on open/closed states
- **Animation Effects**: Create smooth transitions for colors, sizes, and positions

Each example includes complete YAML configuration and explanations of the CSS properties used. You can copy these examples directly into your configuration and adapt them to your needs.

Explore the [YAML Styling Examples](examples/yaml-styling-examples.md) to see what's possible and get inspired for your own custom designs.

## Hover Effects

The Expander Card uses Home Assistant's built-in ripple element (`ha-ripple`) for interactive feedback on button presses and hover states. These effects provide visual confirmation of user interactions and can be fully customized to match your theme.

Hover customization options:

- **Ripple Colors**: Customize hover and press ripple colors independently
- **Opacity Control**: Adjust the intensity of hover and press effects
- **Per-Configuration Styling**: Different hover styles for different title card configurations
- **Theme Integration**: Automatically inherits theme variables when set
- **Disable Options**: Option to completely disable ripple effects if desired

The hover system supports different configurations depending on whether you're using a standard title, a title card without overlay, or a title card with overlay. This ensures your hover effects work perfectly regardless of your card setup.

For detailed information on CSS variables, configuration classes, and hover customization examples, see the [Hover Styling Guide](hover.md).

## Card-Mod

Before the `style` attribute was introduced, [card-mod](https://github.com/thomasloven/lovelace-card-mod) was the primary method for styling expander cards. While card-mod still works with the Expander Card, it is strongly recommended to migrate to the native `style` attribute for better performance and maintainability.

Reasons to use the `style` attribute instead of card-mod:

- **Native Support**: Built directly into the Expander Card with optimized performance
- **Better Maintenance**: Easier to update and maintain styling configurations
- **Improved Reliability**: Less prone to breaking changes from external dependencies
- **Simpler Syntax**: More straightforward configuration without additional wrapper syntax
- **Full Feature Support**: All styling capabilities are available through the `style` attribute

If you're currently using card-mod, migrating to the `style` attribute is usually as simple as moving your CSS from the card-mod configuration to the `style` parameter.

For more information and migration notes, see the [Card-Mod Information](card-mod.md).