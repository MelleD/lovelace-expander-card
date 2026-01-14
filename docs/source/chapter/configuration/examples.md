# Title card

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

## Heading Title card

Example with [heading](https://www.home-assistant.io/dashboards/heading/) title card to provide the possibility of styling your title.

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

## Template Title card with Mushroom

If you need templates in your title, you can make good use of the Mushroom cards. Here's an example using the [Mushroom title card](https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/title.md).

```yaml
      - type: custom:expander-card
        title-card:
          type: custom:mushroom-title-card
          title: |-
            {{ now().hour }}
```

## Simple Title

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

## Title with min-width-expanded

Example with title that is clickable and has 2 nested cards which are automatically expanded when the screen is more than 300px.

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

## Title card with action

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
