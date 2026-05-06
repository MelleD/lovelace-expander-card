"""Generate and verify documentation images and animations from scenario YAML files.

Any scenario that declares a ``doc_image:`` or ``doc_animation:`` key participates
in doc asset generation.

``doc_image``
    Captures a static PNG screenshot.  ``doc_image`` accepts a **single mapping**
    or a **list of mappings**.  Each list entry may include its own
    ``interactions`` sub-key to advance the page to a new state before that
    capture, enabling stepped documentation:

    .. code-block:: yaml

        # Single image
        doc_image:
          output: docs/source/chapter/assets/my-feature.png
          root: expander-card
          padding: 16
          threshold: 0.02

        # Stepped capture — each entry runs additional interactions then captures
        doc_image:
          - output: docs/source/chapter/assets/my-feature-closed.png
            root: expander-card
            padding: 8
          - interactions:
              - type: click
                root: expander-card
                selector: .header
                settle_ms: 600
            output: docs/source/chapter/assets/my-feature-open.png
            root: expander-card
            padding: 8

``doc_animation``
    Captures an animated GIF.  Pillow is required.

    .. code-block:: yaml

        doc_animation:
          output: docs/source/chapter/assets/my-feature.gif
          root: expander-card
          padding: 8
          frames: 12
          interval_ms: 100
          threshold: 0.02

Scenarios are loaded from two locations:

* ``tests/visual/scenarios/`` — regular test scenarios that *also* declare
  ``doc_image:`` and/or ``doc_animation:``.
* ``docs/scenarios/`` — documentation-asset-only scenarios with no functional
  assertions.

Usage
-----

.. code-block:: bash

    # Makefile aliases (recommended)
    make doc_images_gen      # generate missing images; verify existing ones
    make doc_images_update   # regenerate ALL doc images (overwrite existing)

    # Or run pytest directly
    pytest tests/visual/test_doc_images.py
    DOC_IMAGE_UPDATE=1 pytest tests/visual/test_doc_images.py

    # Single image by scenario id
    pytest tests/visual/test_doc_images.py -k expander_collapsed
"""

from __future__ import annotations

import pytest
from ha_testcontainer import HATestContainer
from playwright.sync_api import Page

from ha_testcontainer.visual.scenario_runner import (
    capture_doc_animation,
    capture_doc_image,
    clear_scenario,
    goto_scenario,
    load_all_doc_image_scenarios,
    push_scenario,
    reset_theme,
    run_interactions,
    set_theme,
)

# ---------------------------------------------------------------------------
# Collect scenarios that declare a doc_image: or doc_animation: key.
# ---------------------------------------------------------------------------

_DOC_SCENARIOS = load_all_doc_image_scenarios()
_DOC_SCENARIO_IDS = [s["id"] for s in _DOC_SCENARIOS]
_DOC_SCENARIO_MAP = {s["id"]: s for s in _DOC_SCENARIOS}


# ---------------------------------------------------------------------------
# Parametrised test
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("scenario_id", _DOC_SCENARIO_IDS)
def test_doc_image(
    scenario_id: str,
    ha: HATestContainer,
    ha_page: Page,
    ha_url: str,
    ha_lovelace_url_path: str,
) -> None:
    """Capture and verify documentation assets for an expander card scenario.

    The test pushes the scenario's card configuration to the shared
    ``ha-tests`` Lovelace dashboard, navigates to it, runs any declared
    interactions (setup and post-navigation), then calls
    :func:`capture_doc_image` and :func:`capture_doc_animation` to produce
    the requested documentation assets and compare them against the on-disk
    files.

    The test fails when a captured asset differs from the stored file beyond
    the configured ``threshold``.  Run with ``DOC_IMAGE_UPDATE=1`` to
    regenerate all doc assets.
    """
    scenario = _DOC_SCENARIO_MAP[scenario_id]
    theme = scenario.get("theme")

    push_scenario(ha, ha_lovelace_url_path, scenario)
    if theme:
        set_theme(ha, theme)

    try:
        run_interactions(ha_page, scenario, ha=ha, key="setup")
        goto_scenario(ha_page, ha_url, ha_lovelace_url_path, scenario["view_path"])
        run_interactions(ha_page, scenario, ha=ha)
        capture_doc_image(ha_page, scenario, ha=ha)
        capture_doc_animation(ha_page, scenario, ha=ha)
    finally:
        run_interactions(ha_page, scenario, ha=ha, key="teardown")
        if theme:
            reset_theme(ha)
        clear_scenario(ha, ha_lovelace_url_path)
