# Action Configuration

You can set the state of expander card(s) using the `fire-dom-event` action on any card that supports actions.

1. Set expander card(s) to have `expander-card-id`. Multiple expander cards can share the same id if you wish to set their state together.
2. Set action on another card using the `fire-dom-event` action.

 ```yaml
  tap_action:
    action: fire-dom-event
    expander-card:
      data:
        expander-card-id: <expander-card-id>
        action: < open | close | toggle >
 ```

## Expander card config

```yaml
    - type: custom:expander-card
      expander-card-id: my-expander-card
```

## Action on another card

```yaml
show_name: true
show_icon: true
type: button
name: Expand my-expander-card
icon: mdi:chevron-down
tap_action:
  action: fire-dom-event
  expander-card:
    data:
      expander-card-id: my-expander-card
      action: open
```
