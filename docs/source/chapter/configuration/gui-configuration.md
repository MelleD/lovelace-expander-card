# Graphical config editor

Expander card aligns its concepts as much as possible to Home Assistant Frontend. As such, all expander cards are expanded by default when using UI edit/preview mode. This matches the concept of a Frontend conditional card showing when in edit/preview mode.

On a busy dashboard with many expander cards, and perhaps nested expander cards, showing all as expanded may make it difficult to find the expander card you wish to edit.

If you do not wish to have expander cards expanded by default when in edit/preview mode, you can set `preview-expanded: false` in `expander-card:` yaml key at the top of your dashboard "Raw configuration". It is recommended you place this at the top of your dashboard "Raw configuration" before any Home Assistant view/panel yaml configuration.

> NOTE: Any expander card using `expanded` templates will always honour the template when in preview/edit mode, including sending open state events to other expanders, regardless of the `preview-expanded:` setting. This way the preview/edit mode will match the current display of expander cards on the dashboard.

To access your dashboard "Raw configuration" from the UI use the following steps:

- Go to the dashboard you wish to edit.
- In the top-right corner, select the pencil icon. If you are on a small screen you may need to select the three dots menu ⋮ first and then select **Edit dashboard**.
- Select the three dots menu ⋮ and select **Raw configuration editor**.

Example yaml code to include

```yaml
expander-card:
  preview-expanded: false
views:
  - title: Home
    # ... other dashboard "Raw configuration"
```
