# Expander Card for HomeAssistant

[![release][release-badge]][release-url]
![downloads][downloads-badge]
![build][build-badge]
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=MelleD_lovelace-expander-card&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=MelleD_lovelace-expander-card)
[![PayPal.Me][paypal-me-badge]][paypal-me-url]
[![BuyMeCoffee][buy-me-a-coffee-shield]][buy-me-a-coffee-url]

Expander/Collapsible card for HomeAssistant  

## Introduction

First a few words to start with. A big thank you goes to [@Alia5](https://github.com/Alia5/lovelace-expander-card), who initially launched the card. I forked this card for my own HomeAssistant to make a few improvements. I give no guarantee for the functionality and no promise of lifelong maintenance, as I do the whole thing in my free time. Of course, I am happy about every contribution and PR

## Demo

![Sample gif](examples/example.gif)

---

Expand button as overlay:
![Sample lights overlay](examples/lights_overlay_button.png)

---

You can even nest expanders!  

![Sample nesting](examples/nested.png)

---

Clear Background (default theme):  

![Sample clear router](examples/clear_router.png)

## Options

All options are available for editing in Graphical config editor. Title card config is in YAML at this time.

Yaml Options:

| Name                      | Type     | Default       | Supported options      | Description                                           |
| ------------------------- | -------- | ------------- | ---------------------- | ----------------------------------------------------- |
| type                      | string   | **Required**  | `custom:expander-card` | Type of the card.                                     |
| title                     | string   | Empty         | *                      | Title (Not displayed if using Title-Card)             |
| icon                      | string   | mdi:chevron-down         | mdi icon shortcut                      | Icon in button           |
| expanded                  | boolean  | _false_       | true\|false            | Start expanded                                        |
| animation                 | boolean   | _true_       | true\|false            | Should the opening/closing of expander be animated? |
| min-width-expanded        | number   | 0             | number                 | Min screen width (px) to be expanded on start (use with start expanded above)                                     |
| max-width-expanded        | number   | 0             | number            | Max screen width (px) to be expanded on start (use with start expanded above)                                        |
| storage-id                | string   | **optional**  | *                      | Save last expander state in local browser storage     |
| expander-card-id          | string    | **optional** | *                      | An id to use with [Set state via action](#set-state-via-action)        |
| arrow-color               | string   | primary-text-color,#fff | css-color    | Color of ico expand button                     |
| icon-rotate-degree        | string   | _180deg_      | css-rotate             | Changing the degrees of the button icon when clicked  |
| header-color              | string   | primary-text-color,#fff  | css-color   | Color of expand button                     |
| button-background         | string   | _transparent_ | css-color              | Background color of expand button                     |
| expander-card-background  | string   | ha-card-background, card-background-color,#fff | css-color              | Expander Card Background |
| expander-card-background-expanded    | string   |  Empty    | css-color              | Expander Card Background when card is opened/expanded|
| expander-card-display     | string   | block         | css-display            | Layout/Display of the card                            |
| clear                     | boolean  | _false_       | true\|false            | Remove Background, border                                   |
| gap                       | string   | _0.0em_       | css-size               | gap between cards when expander closed. This option depends on your CSS layout: You might need to use `expander-card-display: grid` for this.                |
| padding                   | string   | _1em_         | css-size               | padding of all card content                           |
| expanded-gap              | string   | _0.6em_       | css-size               | gap between child cards when expander open            |
| child-padding             | string   | _0.0em_       | css-size               | padding of child cards                                |
| child-margin-top          | string   | _0.0em_       | css-size               | Margin top of child cards                             |
| clear-children            | boolean  | _false_       | true\|false            | Remove Background, border from childs                                   |
| title-card                | object   | **optional**  | LovelaceCardConfig     | Replace Title with card                               |
| title-card-clickable      | boolean  | _false_       | true\|false            | Should the complete div be clickable?               |
| title-card-button-overlay | boolean  | _false_       | true\|false            | Overlay expand button over title-card. If you set `title-card-clickable: true` the overlay will extend across the expander and capture the click before the title-card. |
| overlay-margin            | string   | _0.0em_       | css-size               | Margin from top right of expander button (if overlay) |
| title-card-padding        | string   | _0px_         | css-size               | padding of title-card                                 |
| show-button-users         | object[] | **optional**  | *                      | Choose the persons/users that button is visible to them. |
| start-expanded-users      | object[] | **optional**  | *                      | Choose the persons/users that card will be start expanded for them. |
| cards                     | object[] | **optional**  | LovelaceCardConfig[]   | Child cards to show when expanded                     |
| style                     | string   | **optional**. | css style rules        | Advanced css styling rules. if you wish to style/hide the hover/press ripple of the expander-card button you can use advanced styling. See [Hover/press ripple](#hoverpress-ripple). |

## Examples

Here are a few examples of usage.

### Title card

Example title card that is clickable and has 2 nested cards, which is directly expanded

```yaml
    - type: custom:expander-card
      child-margin-top: 0.6em
      padding: 0
      clear: true
      title-card-button-overlay: true
      title-card-clickable: true
      expanded: true
      title-card:
        type: "custom:digital-clock"
        dateFormat:
          weekday: "long"
          day: "2-digit"
          month: "short"
        timeFormat:
          hour: "2-digit"
          minute: "2-digit"
      cards:
        - type: custom:simple-weather-card
          entity: weather.openweathermap
          primary_info:
            - wind_speed
            - wind_bearing
          secondary_info:
            - precipitation
            - precipitation_probability
        - type: custom:hourly-weather
          entity: weather.openweathermap
          icons: true
          show_precipitation_probability: true
          show_precipitation_amounts: true
          forecast_type: "hourly"
          num_segments: 10"
          label_spacing: "1"
          name: null
          show_wind: speed
```

### Heading Title card

Example with [heading](https://www.home-assistant.io/dashboards/heading/) title card to the possiblity to style your title.

```yaml
      - type: custom:expander-card
        title-card:
          type: heading
          heading: Title
          heading_style: title
          badges:
            - type: entity
              show_name: false
              show_state: true
              show_icon: true
              entity: light.bed_light
          icon: mdi:account
```

### Template Title card with Mushroom

If you need templates in your title, you can make good use of the Mushroom cards. Here's an example using the [Mushroom title card](//github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/title.md).
https:

```yaml
      - type: custom:expander-card
        title-card:
          type: custom:mushroom-title-card
          title: |-
            {{ now().hour }}
```

### Simple Title

Example with title that is clickable and has 2 nested cards.

```yaml
      - type: custom:expander-card
        child-margin-top: 0.6em
        padding: 0
        title: "Test"
        title-card-button-overlay: true
        title-card-clickable: true
        cards:
          - type: custom:simple-weather-card
            entity: weather.openweathermap
            primary_info:
              - wind_speed
              - wind_bearing
            secondary_info:
              - precipitation
              - precipitation_probability
          - type: custom:hourly-weather
            entity: weather.openweathermap
            icons: true
            show_precipitation_probability: true
            show_precipitation_amounts: true
            forecast_type: "hourly"
            num_segments: 10"
            label_spacing: "1"
            name: null
            show_wind: speed
```

### Title with min-width-expanded

Example with title that is clickable and has 2 nested cards with are automatically expanded when the screen is more than 300px.

```yaml
      - type: custom:expander-card
        child-margin-top: 0.6em
        padding: 0
        title: "Test"
        title-card-button-overlay: true
        title-card-clickable: true
        min-width-expanded: 300
        cards:
          - type: custom:simple-weather-card
            entity: weather.openweathermap
            primary_info:
              - wind_speed
              - wind_bearing
            secondary_info:
              - precipitation
              - precipitation_probability
            name: in Gärtringen
          - type: custom:hourly-weather
            entity: weather.openweathermap
            icons: true
            show_precipitation_probability: true
            show_precipitation_amounts: true
            forecast_type: "hourly"
            num_segments: 10"
            label_spacing: "1"
            show_wind: speed
```

### Title card with action 

The configuration below will open or close the expander when you tap the Mushroom Light Card. This means you cannot switch the light on or off by tapping it, but you can still adjust the brightness.

```yaml
    type: custom:expander-card
    title: Expander Card
    expander-card-id: my-light-card
    cards:
      - type: entities
        entities:
          - entity: sun.sun
    title-card:
      type: tile
      entity: light.bed_light
      vertical: false
      features_position: inline
      features:
        - type: light-brightness
      tap_action:
        action: fire-dom-event
        expander-card:
          data:
            expander-card-id: my-light-card
            action: toggle
```

## Set state via action

You can set the state of expander card(s) using the `fire-dom-event` action on any card that supports actions.

1. Set expander card(s) to have `expander-card-id`. Multiple expander cards can shared the same id if you wish to set their state together.
2. Set action on another card using the `fire-dom-event` action.

 ```yaml
  tap_action:
    action: fire-dom-event
    expander-card:
      data:
        expander-card-id: <expander-card-id>
        action: < open | close | toggle >
 ```

Example

### Expander card config

```yaml
    - type: custom:expander-card
      expander-card-id: my-expander-card
```

### Action on another card

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

## Style

You can do advanced styling using the `style` configuration parameter. Classes available are per the images below.

![Expander Card Styling - Title](examples/styling2.png)

![Expander Card Styling - Title Card](examples/styling1.png)

![Expander Card Styling - Title Card & Overlay](examples/styling3.png)

### State

For all elements shown, the class `open` will be added when the Expander card is open, and `closed` added when the Expander is closed.

### Animation

When Expander card animation is enabled, for all elements except those listed below, the class `opening` will be added when the expander is in the process of opening and the class `closing` will be added when the expander is in the process of closing. When not `opening` or `closing`, the class `idle` will be added. The class `animation` will also be added. You may wish to use these classes for transition affects. Expander card uses `0.35s ease` for transitions. See the final example below for transitioning title font size and color.

> NOTE: `.outer-container` for Title card will not have `animation` or `opening`/`closing` applied.

### Special considerations

1. `.children-wrapper` is used for opening/closing animation and hiding children cards. You should not style this element. It is shown for completeness.
2. `margin-bottom` on each children card's `.outer-container` is used to transition cards sliding down and up while animating. Do not style `margin-bottom` and if altering any transitions, extend the included `transition` style for `opening` and `closing`.
3. As much as possible, use class selector combinations to get your styles to a higher specificity. e.g. `.expander-card.animation.open` is more specific than any built in classes so if you use that selector, you as less likely to need to use `!important`.
4. For animation, during opening, the classes will be `open` and `opening`. During closing, classes will be `open` and `closing` until the close sequence has ended after which the classes will be `close` and `idle`.
5. If you are considering any transition affects, check those already applied and extend those with any styling you add.

### Styling Examples

Using an example to set the background based on the status. As background color is a transition element, you need to style both `open` & `opening` and `close` and `closing` to get the background to transition during opening/closing. Otherwise the transition will take place after the expander has opened/closed.

```yaml
style: |-
  .expander-card.animation.open,
  .expander-card.animation.opening {
    background-color: red;
  }
  .expander-card.animation.close,
  .expander-card.animation.closing {
    background-color: #C8A2C8;
  }
```

Only the background of the button. Here `!important` is needed if you wish to override the hover ripple.

```yaml
style: |
  .header.animation.open,
  .header.animation.opening {
    background-color: red !important;
  }
  .header.animation.close,
  .header.animation.closing {
    background-color: #C8A2C8 !important;
  }
```

Switching the arrow from right to left, with reduced horizontal padding of the button.

```yaml
style: |
  .header {
    flex-direction: row-reverse !important;
    padding: 0.8em 0 !important;
  }
```

If you have a title-card - without overlay

```yaml
style: |
  .title-card-header {
    flex-direction: row-reverse !important;
    padding: 0.8em 0 !important;
  }
```

If you have a title-card - with overlay

```yaml
style: |
  .title-card-header-overlay > .header-overlay {
    flex-direction: row-reverse !important;
    padding: 0.8em 0 !important;
  }
```

Transitioning the title font size and color. Here the `!important` on `close`/`closing` is to make sure that the font size and color both change on `closing` as `open` will still be added until fully closed at which stage `close` will be added and `open` removed.

```yaml
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
```

Change the title size

```yaml
style: |
  .title {
    font-size: var(--ha-font-size-l);
  }
```

## Hover/press ripple

Expander-card uses the inbuilt Home Assistant ripple element `ha-ripple` for hover/press ripple animation on for expander-card button. If you wish to style/hide the ripple you can use the following CSS variables with advanced styling. If these are set in your theme they will be applied and you don't need to do anything at all.

**NOTE**: If you only wish to style the expander-card ripple itself you will need to apply to the appropriate class listed below. Otherwise if you apply to `.expander-card` it will change the ripple for all cards within the expander.

| Config | Class |
|--------|-------|
| No title card | `.header` |
| Title card without overlay | `.title-card-header` |
| Title card with overlay | `.header` |

Change the hover/press ripple color. No title card.

```yaml
style: |
  .header {
    -ha-ripple-color: red;
  }
```

| Ripple CSS Variable | Usage   | Accepts | Default |
|---------------------|---------|---------|---------|
| `--ha-ripple-color` | Hover/press ripple color. Set to `none` if you wish to disable all ripples. | CSS color | `var(--secondary-text-color)` |
| `--ha-ripple-hover-color` | Hover ripple color. Set if you wish it to be different from pressed color. | CSS color | `var(--ha-ripple-color, var(--secondary-text-color))` |
| `--ha-ripple-pressed-color` | Pressed ripple color. Set if you wish to be different from hover color. | CSS color | `var(--ha-ripple-color, var(--secondary-text-color))` |
| `--ha-ripple-hover-opacity` | Opacity of the hover ripple. | CSS opacity | 0.08 |
| `--ha-ripple-pressed-opacity` | Opacity of the pressed ripple. | CSS opacity | 0.12 | 

## Card Mod

Before the `style` attribute, [card mod](https://github.com/thomasloven/lovelace-card-mod) was used to style the card. Although card-mod still works, it is better to switch everything to use the `style` attribute. Please do not open issue(s) when card mod is not working.

## Installation

### HACS

Expander-Card is available in [HACS][hacs] (Home Assistant Community Store) by default.

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant 
3. Searching for expander card

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=MelleD&repository=lovelace-expander-card&category=plugin)

### Manual

1. Download `expander-card.js` file from the [latest release][release-url].
2. Put `expander-card.js` file into your `config/www` folder.
3. Add reference to `expander-card.js` in Dashboard. There's two way to do that:
    - **Using UI:** _Settings_ → _Dashboards_ → _More Options icon_ → _Resources_ → _Add Resource_ → Set _Url_ as `/local/expander-card.js` → Set _Resource type_ as `JavaScript Module`.
      **Note:** If you do not see the Resources menu, you will need to enable _Advanced Mode_ in your _User Profile_
    - **Using YAML:** Add following code to `lovelace` section.

      ```yaml
        resources:
            - url: /local/expander-card.js
              type: module
        ```

## FAQ

### Issue after upgrade to HA 2025.6

There is/was an issue after upgrading to HA 2025.6 (maybe with newer version is not valid anymore)
See [forum](https://community.home-assistant.io/t/expander-accordion-collapsible-card/738817/56?u=melled) and [issue](https://github.com/MelleD/lovelace-expander-card/issues/506) 
a) For the view type [sections](https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/) `cards` is not working anymore. You have to rename it to `sections`.

Before

 ```yaml
views:
  - title: MyView
    path: my-view
    cards: ...
```

Now

 ```yaml
views:
  - title: MyView
    path: my-view
    sections: ...
```

### Option Gap is not working

If this option doesn't work, check your browser's console output. Your current CSS layout might not support this option.
You can use the `expander-card-display: grid` option to set a layout that supports this option.

## Support

Clone and create a PR to help make the card even better.

Please ⭐️ or sponsor this repo when you like it.

## Sponsor ❤️

<a href="" target="_blank"><img src="https://img.shields.io/static/v1.svg?label=%20&message=PayPal.Me&logo=paypal" alt="PayPal.Me MelleDennis" style="height: auto !important;width: auto !important;" ></a>

<a href="https://www.buymeacoffee.com/melled" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/white_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

<!-- Badges -->

[hacs-badge]: https://img.shields.io/badge/hacs-default-orange.svg?style=flat-square
[release-badge]: https://img.shields.io/github/v/release/MelleD/lovelace-expander-card?style=flat-square
[downloads-badge]: https://img.shields.io/github/downloads/MelleD/lovelace-expander-card/total?style=flat-square
[build-badge]: https://img.shields.io/github/actions/workflow/status/MelleD/lovelace-expander-card/build.yml?branch=main&style=flat-square
[paypal-me-badge]: https://img.shields.io/static/v1.svg?label=%20&message=PayPal.Me&logo=paypal
[buy-me-a-coffee-shield]: https://img.shields.io/static/v1.svg?label=%20&message=Buy%20me%20a%20coffee&color=6f4e37&logo=buy%20me%20a%20coffee&logoColor=white

<!-- References -->

[hacs-url]: https://github.com/hacs/integration
[home-assistant]: https://www.home-assistant.io/
[hacs]: https://hacs.xyz
[release-url]: https://github.com/MelleD/lovelace-expander-card/releases
[paypal-me-url]: https://www.paypal.me/MelleDennis
[buy-me-a-coffee-url]: https://www.buymeacoffee.com/melled
