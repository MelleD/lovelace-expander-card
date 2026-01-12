# Template Support

Expander card supports javascript templates for the config items listed below. This list may be added to over time based on user feature requests. If you wish for a config item to be supported by javascript template please submit a feature request.

| Config item | Accepts value | Overrides config items |
| ----------- | ------------- | ---------------------- |
| `expanded`  | boolean (`true\|false`) | `expanded`, `min-width-expanded`, `max-width-expanded`, `start-expanded-users` |
| `title`     | string        | `title` |
| `icon`      | string        | `icon`  |
| `arrow-color` | CSS color (string)  | `arrow-color` |
| `style`     | string        | `style` |

Javascript templates are implemented using the [home-assistant-javascript-templates](https://github.com/elchininet/home-assistant-javascript-templates) library by @elchininet. For objects and methods supported see [Objects and methods available in the templates](https://github.com/elchininet/home-assistant-javascript-templates#objects-and-methods-available-in-the-templates). The `config` object is also available which is the config object for the expander card where all config items can be read. e.g. `config['expander-card-id']`.

Templates may also use `variables`, which are also javascript templates or just values. Templates are reactive to `variables` such that if a variable template value changes, the template using the variable itself will be evaluated and return its value. Expander card uses the [home-assistant-javascript-templates](https://github.com/elchininet/home-assistant-javascript-templates) `refs` feature using `variables` as the `refsVariableName`. You are best to ignore anything about `refs` in the library unless you know what you are doing.

Templates also have access to special variables which track the expanded state of any expander on the Dashboard which has `expander-card-id` config set. See [Templates - tracking expanded state of other expander cards](#templates---tracking-expanded-state-of-other-expander-cards)

Templates are not continually evaluated but rely on reactive properties for updates. Follow the guidelines in [Objects and methods available in the templates](https://github.com/elchininet/home-assistant-javascript-templates#objects-and-methods-available-in-the-templates).

Javascript for variables and templates are set using `value_template` string, enclosing javascript with `[[[]]]`, that is three open square bracket `[[[` followed by three close square bracket `]]]`. This follows the convention followed by other custom cards for javascript templates. Variables and templates can also return a straight value, which will follow YAML syntax converted to the type required for the config item being templated e.g. for a config item that accepts `boolean`, `true`, `"True"`, `1`, `"1"` are all considered `true`.

## Variables

Variables are defined in the `variables` list of expander card config.

**IMPORTANT**: As variables are evaluated asynchronously, their initial value will be `undefined`. Your templates need to be written to handle this initial case.

| List item | Type | Config |
| --------- | ---- | ------ |
| `variable` | string | The `<name>` of the variable which will be available in templates as `variable.<name>`. |
| `value_template` | string \| value \| object | Either javascript that returns a value or a straight value. Javascript must be enclosed by `[[[]]]` with only whitespace preceding or following. |

Variable `weather_warnings` tracking the state of `input_boolean.weather_warnings`.

```yaml
variables:
  - variable: weather_warnings
    value_template: |
      [[[
        return is_state('input_boolean.weather_warnings', 'on');
      ]]]
```

## Templates

Templates are defined in the `templates` list of expander card config.

| List item | Type | Config |
| --------- | ---- | ------ |
| `template` | string | The config item being templated. Only supported config items will be read by expander card. See list in main [Advanced javascript templates](#advanced-javascript-templates) section. |
| `value_template` | string \| value \| object | Either javascript that returns a value or a straight value. Javascript must be enclosed by `[[[]]]` with only whitespace preceding of following. The type of the value \| object returned/set must be applicable to the config item being templated. |

Template for `expanded` config item tracking state of `input_boolean.weather_warnings`.

```yaml
templates:
  - template: expanded
    value_template: |
       [[[
         return is_state('input_boolean.weather_warnings', 'on');
       ]]]
```

Same template using variable `weather_warnings` and adding a `style` template. Note the use of the nullish coalescing (??) operator to handle variables being undefined until their value is set.

```yaml
variables:
  - variable: weather_warnings
    value_template: |
      [[[
        return is_state('input_boolean.weather_warnings', 'on');
      ]]]
templates:
  - template: expanded
    value_template: |
       [[[
         return variables.weather_warnings ?? false;
       ]]]
  - template: style
    value_template: |
      [[[
        return `
          .title 
          { 
            transition: color 0.35s ease, font-weight 0.35s ease;
            color: ${variables.weather_warnings ? 'red' : 'var(--primary-text-color)'};
            font-weight: ${variables.weather_warnings ? '700' : 'var(--ha-font-weight-body)'};
          }`;
      ]]]
```

More user examples can be found in [Show and tell](https://github.com/MelleD/lovelace-expander-card/discussions/categories/show-and-tell) discussion topic. If you have an example please submit to this discussion topic.

### Templates - tracking expanded state of other expander cards

If you set `expander-card-id` in an expander card it will broadcast its state to all expander cards on the open Dashboard. When using templates, the expanded state will be in special variables of the form `variables.['<expander-card-id>_open']`.

If you have an expander card with `expander-card-id: my-expander-id` its expanded state will be available in templates via `variables['my-expander-id_open']`. Note here that Javascript access to the variable is via `[]` due to the `expander-card-id` having `-` in it. If you use `_` so that the `expander-card-id` is a valid object accessor, you can use `.` accessor. e.g. `expander-card-id: my_expander_id` => `variables.my_expander_id_open`.

### Example - using expander card open state variables

This example shows using expander card open state variable for expanded template of other expander cards. The variables can also be used in any template config supported by expander card.

Master expander card

```yaml
type: custom:expander-card
title: Expander Card - Master
expander-card-id: test_expander_id
cards:
  - type: entity
    entity: light.kitchen_lights
```

Expander card following master

```yaml
type: custom:expander-card
title: Expander Card - Follow
cards:
  - type: entity
    entity: light.bed_light
templates:
  - template: expanded
    value_template: |-
      [[[
        return variables.test_expander_id_open;
      ]]]
```

Expander card following with opposite open state

```yaml
type: custom:expander-card
title: Expander Card - Opposite Follow
cards:
  - type: entity
    entity: light.bed_light
templates:
  - template: expanded
    value_template: |-
      [[[
        return !variables.test_expander_id_open;
      ]]]
```
