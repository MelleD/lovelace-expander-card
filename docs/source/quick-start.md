# Quick Start

## Installation

### HACS

Expander-Card is available in [HACS](https://www.hacs.xyz/) (Home Assistant Community Store) by default.

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Searching for expander card

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=MelleD&repository=lovelace-expander-card&category=plugin)

### Manual

1. Download `expander-card.js` file from the [latest release](https://github.com/MelleD/lovelace-expander-card/releases/latest).
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
