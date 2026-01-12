# Style

You can do advanced styling using the `style` configuration parameter. Classes available are per the images below.

![Expander Card Styling - Title](../assets/styling2.png)

![Expander Card Styling - Title Card](../assets/styling1.png)

![Expander Card Styling - Title Card & Overlay](../assets/styling3.png)

## State

For all elements shown, the class `open` will be added when the Expander card is open, and `closed` added when the Expander is closed.

## Animation

When Expander card animation is enabled, for all elements except those listed below, the class `opening` will be added when the expander is in the process of opening and the class `closing` will be added when the expander is in the process of closing. When not `opening` or `closing`, the class `idle` will be added. The class `animation` will also be added. You may wish to use these classes for transition affects. Expander card uses `0.35s ease` for transitions. See the final example below for transitioning title font size and color.

> NOTE: `.outer-container` for Title card will not have `animation` or `opening`/`closing` applied.

## Special considerations

1. `.children-wrapper` is used for opening/closing animation and hiding children cards. You should not style this element. It is shown for completeness.
2. `margin-bottom` on each children card's `.outer-container` is used to transition cards sliding down and up while animating. Do not style `margin-bottom` and if altering any transitions, extend the included `transition` style for `opening` and `closing`.
3. As much as possible, use class selector combinations to get your styles to a higher specificity. e.g. `.expander-card.animation.open` is more specific than any built in classes so if you use that selector, you as less likely to need to use `!important`.
4. For animation, during opening, the classes will be `open` and `opening`. During closing, classes will be `open` and `closing` until the close sequence has ended after which the classes will be `close` and `idle`.
5. If you are considering any transition effects, check those already applied and extend those with any styling you add.

