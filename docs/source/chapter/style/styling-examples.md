# Styling examples

This page provides practical examples of styling the Expander Card using the `style` configuration parameter. Each example includes complete YAML code that you can copy and adapt to your needs.

These examples demonstrate various styling techniques, from simple color changes to complex animations and layout modifications. Understanding these patterns will help you create custom designs that perfectly match your dashboard.

## Style Format

The `style` configuration parameter supports two formats:

### String Format (CSS Text)

The traditional way to define styles using a string containing CSS rules:

```yaml
type: custom:expander-card
title: String Style Example
style: |
  .expander-card {
    background-color: red;
    padding: 1em;
  }
cards:
  - type: entity
    entity: light.living_room
```

### Object Format (Structured)

Alternatively, you can use an object structure where keys are CSS selectors and values are arrays of property strings:

```yaml
type: custom:expander-card
title: Object Style Example
style:
  .expander-card:
    - background-color: red
    - padding: 1em
  .header > .title:
    - font-size: var(--ha-font-size-l)
    - color: green
cards:
  - type: entity
    entity: light.living_room
```

Both formats produce the same result. The object format can be more readable and easier to maintain for complex styles.

## Background Color Transitions

### Animated Background Based on State

This example sets the background color based on the expansion state with smooth transitions. As background color is a transition element, you need to style both `open` & `opening` and `close` & `closing` to get the background to transition during opening/closing. Otherwise the transition will take place after the expander has fully opened/closed.

```yaml
type: custom:expander-card
title: Animated Background
style: |-
  .expander-card.animation.open,
  .expander-card.animation.opening {
    background-color: red;
  }
  .expander-card.animation.close,
  .expander-card.animation.closing {
    background-color: #C8A2C8;
  }
cards:
  - type: entity
    entity: light.living_room
```

### Button Background Only

Style only the background of the header button. Here `!important` is needed if you wish to override the hover ripple effect.

```yaml
type: custom:expander-card
title: Button Background
style: |
  .header.animation.open,
  .header.animation.opening {
    background-color: red !important;
  }
  .header.animation.close,
  .header.animation.closing {
    background-color: #C8A2C8 !important;
  }
cards:
  - type: entity
    entity: light.bedroom
```

The same example using the object format:

```yaml
type: custom:expander-card
title: Button Background (Object Format)
style:
  .header.animation.open, .header.animation.opening:
    background-color: red !important
  .header.animation.close, .header.animation.closing:
    background-color: '#C8A2C8 !important'
cards:
  - type: entity
    entity: light.bedroom
```

## Layout Modifications

### Arrow Position - Left Side

Move the arrow from the right side to the left side, with reduced horizontal padding of the button.

```yaml
type: custom:expander-card
title: Left Arrow
style: |
  .header {
    flex-direction: row-reverse !important;
    padding: 0.8em 0 !important;
  }
cards:
  - type: entity
    entity: sensor.temperature
```

### Arrow Position with Title Card (No Overlay)

If you have a title card without overlay, use the `.title-card-header` class.

```yaml
type: custom:expander-card
title-card:
  type: entity
  entity: sensor.weather
style: |
  .title-card-header {
    flex-direction: row-reverse !important;
    padding: 0.8em 0 !important;
  }
cards:
  - type: entity
    entity: sensor.humidity
```

### Arrow Position with Title Card (With Overlay)

If you have a title card with overlay enabled, target the overlay header.

```yaml
type: custom:expander-card
title-card:
  type: picture
  image: /local/image.jpg
title-card-overlay: true
style: |
  .title-card-header-overlay > .header-overlay {
    flex-direction: row-reverse !important;
    padding: 0.8em 0 !important;
  }
cards:
  - type: entity
    entity: media_player.living_room
```

## Title Styling

### Animated Title Font and Color

Transition the title font size and color during expansion. The `!important` on `close`/`closing` ensures that the font size and color both change during the closing animation, as the `open` class remains until fully closed.

```yaml
type: custom:expander-card
title: Dynamic Title
style: |
  .header > .title {
    transition: color 0.35s ease, font-size 0.35s ease;
  }
  .header.animation.close > .title, 
  .header.animation.closing > .title
  {
    color: green !important;
    font-size: var(--ha-font-size-l) !important;
  }
  .header.animation.open > .title,
  .header.animation.opening > .title
  {
    color: red;
    font-size: var(--ha-font-size-m);
  }
cards:
  - type: entities
    entities:
      - light.kitchen
```

### Static Title Size

Simply change the title font size without animations.

```yaml
type: custom:expander-card
title: Large Title
style: |
  .title {
    font-size: var(--ha-font-size-l);
  }
cards:
  - type: entity
    entity: climate.thermostat
```

## Title Card Overlay Adjustments

### Match Overlay to Arrow Height

Change the height of the title card overlay to match the arrow height.

```yaml
type: custom:expander-card
title-card:
  type: picture
  image: /local/background.jpg
title-card-overlay: true
style: |
  .header-overlay {
    height: unset !important;
  }
cards:
  - type: weather-forecast
    entity: weather.home
```

### Relative Overlay Height

Change the height of the title card overlay relative to the title card height. The CSS variable `--expander-card-overlay-height` is automatically set based on title card height and overlay margin.

```yaml
type: custom:expander-card
title-card:
  type: picture
  image: /local/header.jpg
title-card-overlay: true
style: |
  .header-overlay {
    height: calc(var(--expander-card-overlay-height) * 0.66) !important;
  }
cards:
  - type: entities
    entities:
      - sensor.temperature
      - sensor.humidity
```

## Complex Example Using Object Format

Here's a comprehensive example demonstrating the object format with multiple selectors and properties:

```yaml
type: custom:expander-card
title: Complex Styling Example
style:
  .expander-card.animation.open, .expander-card.animation.opening:
    - background-color: '#1e3a8a'
    - transition: background-color 0.35s ease
  .expander-card.animation.close, .expander-card.animation.closing:
    - background-color: '#047857'
    - transition: background-color 0.35s ease
  .header > .title:
    - font-size: var(--ha-font-size-l)
    - color: '#ffffff'
    - font-weight: bold
    - transition: color 0.35s ease, font-size 0.35s ease
  .header.animation.open > .title, .header.animation.opening > .title:
    - color: '#fbbf24'
    - font-size: var(--ha-font-size-xl)
  .header.animation.close > .title, .header.animation.closing > .title:
    - color: '#ffffff'
    - font-size: var(--ha-font-size-l)
  .arrow:
    - color: '#fbbf24'
cards:
  - type: entity
    entity: light.living_room
```

This example demonstrates:

- Background color transitions between states
- Title color and size changes with smooth transitions
- Custom arrow color
- Multiple CSS properties per selector
- Combining multiple selectors with commas

## Tips and Best Practices

### Style Format Choice

Choose the format that works best for your use case:

- **String format**: Better for copy-pasting existing CSS or when using complex selectors
- **Object format**: More readable and easier to maintain, especially for configurations with many style rules

### Specificity

Use class selector combinations to increase specificity and avoid needing `!important`:

- `.expander-card.animation.open` is more specific than just `.expander-card`
- `.header.animation.open > .title` targets specifically the title in an open animated header

### Animation States

When styling for animations, remember:

- During opening: `open` and `opening` classes are both present
- During closing: `open` and `closing` classes are both present until fully closed
- When idle: `idle` class is present along with either `open` or `close`

### Transitions

For smooth animations:

- Use matching transition durations (expander card uses `0.35s ease` by default)
- Apply transitions to the base element, not just the state classes
- Style both opening and closing states for seamless transitions

### Testing

Always test your styles in the Home Assistant UI:

- Check both light and dark themes if your instance supports theme switching
- Test expansion and collapse animations to ensure smooth transitions
- Verify that hover effects work as expected
- Check responsive behavior at different screen sizes

### Resources

For more advanced styling:

- See the [Advanced Styling Guide](../style.md) for CSS class documentation
- Check [Hover Effects](../hover.md) for ripple customization
- Review Home Assistant's CSS variables in your theme configuration
- Explore the [templating section](../../templating/index.md) for dynamic styling based on entity states
