# Templating

Welcome to the templating section of the Expander Card! This powerful feature enables you to create dynamic, state-responsive expander cards that automatically adapt based on entity states, conditions, and user interactions. Templating takes your dashboard from static to intelligent.

Templating allows you to programmatically control various aspects of the Expander Card using JavaScript expressions. Instead of hardcoding values, you can create rules that evaluate in real-time, making your cards react to changes in your Home Assistant entities and their states.

## JavaScript Templates

The Expander Card offers comprehensive JavaScript templating support to dynamically customize behavior, styling, and display properties. Templates allow you to create conditional logic, respond to entity state changes, and build sophisticated automation directly into your cards.

Key templating capabilities include:

- **Dynamic Expansion State**: Control whether cards are expanded or collapsed based on entity states or conditions
- **Conditional Styling**: Change colors, fonts, and visual appearance based on real-time data
- **Responsive Content**: Update titles, icons, and other properties dynamically
- **Variable Support**: Define reusable variables for cleaner template code
- **Cross-Card Communication**: Track and respond to the state of other expander cards
- **Entity State Tracking**: React automatically when your Home Assistant entities change

Templates are evaluated reactively, meaning they automatically update when the underlying data changes, providing a seamless and responsive user experience.

For a comprehensive guide on implementing JavaScript templates, including syntax, available methods, variables, and practical examples, visit the [JavaScript Template Documentation](template.md).

## Actions

The Expander Card supports a powerful action system that allows you to control expander cards programmatically from other cards and automations. This enables you to create interactive dashboards where buttons, entity cards, or other elements can open, close, or toggle expander cards.

Action support includes:

- **Remote Control**: Open, close, or toggle expander cards from any card that supports actions
- **Grouped Control**: Control multiple expander cards simultaneously using shared IDs
- **Fire-DOM-Event Integration**: Seamless integration with Home Assistant's action system
- **Button Integration**: Create dedicated control buttons for your expander cards
- **Automation Triggers**: Integrate with your Home Assistant automations and scripts

Actions provide a flexible way to create interactive dashboard layouts where different parts of your UI can communicate and respond to user interactions.

For detailed information on configuring and using actions, including complete examples and setup instructions, see the [Action Configuration Guide](action.md).
