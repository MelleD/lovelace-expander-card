# FAQ

## Issue after upgrade to HA 2025.6

There was an issue after upgrading to HA 2025.6 (this may not be valid anymore in newer versions)
See [forum](https://community.home-assistant.io/t/expander-accordion-collapsible-card/738817/56?u=melled) and [issue](https://github.com/MelleD/lovelace-expander-card/issues/506).
For the view type [sections](https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/) `cards` is not working anymore. You have to rename it to `sections`.

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

## Option Gap is not working

If this option doesn't work, check your browser's console output. Your current CSS layout might not support this option.
You can use the `expander-card-display: grid` option to set a layout that supports this option.