# Configuration Overview

All configurations are available for editing in Graphical config editor. Config items supporting [templating](../templating/index.md) are shown with :octicons-project-template-24:.

|Name|Type|Default|Supported options|Description|
|---|---|---|---|---|
|type|string|**Required**|`custom:expander-card`|Type of the card.|
|title :octicons-project-template-24:|string|Empty|*|Title (Not displayed if using Title-Card)|
|icon :octicons-project-template-24:|string|mdi:chevron-down|mdi icon shortcut|Icon in button|
|expanded :octicons-project-template-24:|boolean|_false_|true\|false|Start expanded|
|animation|boolean|_true_|true\|false|Should the opening/closing of expander be animated?|
|haptic|string|_light_|light\|medium\|heavy\|success\|warning\|failure\|selection\|none|Haptic feedback type for Home Assistant Companion app on iOS and Android when expanding/collapsing the card. Set to 'none' to disable haptic feedback.|
|min-width-expanded|number|0|number|Min screen width (px) to be expanded on start (use with start expanded above)|
|max-width-expanded|number|0|number|Max screen width (px) to be expanded on start (use with start expanded above)|
|storage-id|string|**optional**|*|Save last expander state in local browser storage|
|expander-card-id|string|**optional**|*|An id to use with [Set state via action](../templating/action.md)|
|arrow-color :octicons-project-template-24:|string|primary-text-color,#fff|css-color|Color of icon expand button|
|icon-rotate-degree|string|_180deg_|css-rotate|Changing the degrees of the button icon when clicked|
|header-color|string|primary-text-color,#fff|css-color|Color of expand button|
|button-background|string|_transparent_|css-color|Background color of expand button|
|expander-card-background|string|ha-card-background, card-background-color,#fff|css-color|Expander Card Background|
|expander-card-background-expanded|string|Empty|css-color|Expander Card Background when card is opened/expanded|
|expander-card-display|string|block|css-display|Layout/Display of the card|
|clear|boolean|_false_|true\|false|Remove Background, border|
|gap|string|_0.0em_|css-size|gap between cards when expander is closed. This option depends on your CSS layout: You might need to use `expander-card-display: grid` for this.|
|padding|string|_1em_|css-size|padding of all card content|
|expanded-gap|string|_0.6em_|css-size|gap between child cards when expander open|
|child-padding|string|_0.0em_|css-size|padding of child cards|
|child-margin-top|string|_0.0em_|css-size|Margin top of child cards|
|clear-children|boolean|_false_|true\|false|Remove Background, border from children|
|title-card|object|**optional**|LovelaceCardConfig|Replace Title with card|
|title-card-clickable|boolean|_false_|true\|false|Should the complete div be clickable?|
|title-card-button-overlay|boolean|_false_|true\|false|Overlay expand button over title-card. If you set `title-card-clickable: true` the overlay will extend across the expander, both horizontally and vertically, and capture the click before the title-card. If you wish to adjust the overlay height you can style `height` on `.header-overlay`. See [Style](../style/style.md)|
|overlay-margin|string|_0.0em_|css-size|Margin from top right of expander button (if overlay)|
|title-card-padding|string|_0px_|css-size|padding of title-card|
|show-button-users|object[]|**optional**|*|Choose the persons/users that button is visible to them.|
|start-expanded-users|object[]|**optional**|*|Choose the persons/users that card will be start expanded for them.|
|cards|object[]|**optional**|LovelaceCardConfig[]|Child cards to show when expanded|
|style :octicons-project-template-24:|string or object|**optional**|css style rules or structured style object|Advanced css styling rules. Supports string format (CSS text) or object format (structured with selectors as keys and property string arrays as values). See [Style](../style/style.md) and [Styling Examples](../style/styling-examples.md).|
|variables|dictionary|**optional**|List|See Advanced javascript templates|
|templates|dictionary|**optional**|List|See Advanced javascript templates|

!!! tip "Editing `style` in Graphical config editor"
    When editing `style` in Graphical config editor the default mode is CSS text. To enabled Structured object editing, switch to code editor mode, set style to be a YAML object, and switch back to visual editor mode. Your config will now always view as an Structured object in the visual editor.
