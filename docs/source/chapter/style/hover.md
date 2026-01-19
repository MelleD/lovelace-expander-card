# Hover/press ripple

The Expander Card uses the inbuilt Home Assistant ripple element `ha-ripple` for hover/press ripple animation on for expander-card button. If you wish to style/hide the ripple you can use the following CSS variables with advanced styling. If these are set in your theme they will be applied and you don't need to do anything at all.

**NOTE**: If you only wish to style the expander-card ripple itself, you will need to apply to the appropriate class listed below. Otherwise if you apply to `.expander-card` it will change the ripple for all cards within the expander.

Config | Class
--- | ---
No title card | `.header`
Title card without overlay | `.title-card-header`
Title card with overlay | `.header`

Change the hover/press ripple color. No title card.

```yaml
style: |
  .header {
    --ha-ripple-color: red;
  }
```

Ripple CSS Variable|Usage|Accepts|Default
-|-|-|-
`--ha-ripple-color`|Hover/press ripple color. Set to `none` if you wish to disable all ripples.|CSS color|`var(--secondary-text-color)`
`--ha-ripple-hover-color`|Hover ripple color. Set if you wish it to be different from pressed color.|CSS color|`var(--ha-ripple-color, var(--secondary-text-color))`
`--ha-ripple-pressed-color`|Pressed ripple color. Set if you wish to be different from hover color.|CSS color|`var(--ha-ripple-color, var(--secondary-text-color))`
`--ha-ripple-hover-opacity`|Opacity of the hover ripple.|CSS opacity|0.08
`--ha-ripple-pressed-opacity`|Opacity of the pressed ripple.|CSS opacity|0.12
