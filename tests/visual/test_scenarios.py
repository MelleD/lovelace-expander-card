"""YAML-driven parametrised visual tests for the expander card.

Each ``.yaml`` file under ``tests/visual/scenarios/`` defines one test
scenario.  Tests are collected automatically and can be run individually::

    # Run all scenarios
    pytest tests/visual/test_scenarios.py

    # Run a single scenario by its ``id`` field
    pytest tests/visual/test_scenarios.py -k expander_collapsed

    # Run all expander scenarios
    pytest tests/visual/test_scenarios.py -k expander

Adding a new test
-----------------
Create a new ``.yaml`` file in ``tests/visual/scenarios/`` (or any
sub-directory).  No Python changes are needed.  See the existing files for the
schema and the ``scenario_runner`` module for the full list of assertion types.
"""

from __future__ import annotations

import pytest
from playwright.sync_api import Page

from ha_testcontainer.visual.scenario_runner import (
    clear_scenario,
    goto_scenario,
    load_all_scenarios,
    push_scenario,
    reset_theme,
    run_assertions,
    run_interactions,
    set_theme,
)

# ---------------------------------------------------------------------------
# Collect scenarios at import time so pytest can parametrize correctly.
# ---------------------------------------------------------------------------

_ALL_SCENARIOS = load_all_scenarios()
_SCENARIO_IDS = [s["id"] for s in _ALL_SCENARIOS]
_SCENARIO_MAP = {s["id"]: s for s in _ALL_SCENARIOS}


# ---------------------------------------------------------------------------
# Parametrised test
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("scenario_id", _SCENARIO_IDS)
def test_scenario(
    scenario_id: str,
    ha,
    ha_page: Page,
    ha_url: str,
    ha_lovelace_url_path: str,
) -> None:
    """Run a single expander card visual scenario defined in a YAML file.

    The test pushes the scenario's card configuration to the shared
    ``ha-tests`` Lovelace dashboard, navigates to it, runs all declared
    assertions, then cleans up.  An optional ``theme:`` key in the YAML
    activates the named HA theme before navigation and resets it afterwards.
    """
    scenario = _SCENARIO_MAP[scenario_id]
    theme = scenario.get("theme")

    push_scenario(ha, ha_lovelace_url_path, scenario)
    if theme:
        set_theme(ha, theme)

    try:
        run_interactions(ha_page, scenario, ha=ha, key="setup")
        goto_scenario(ha_page, ha_url, ha_lovelace_url_path, scenario["view_path"])
        run_interactions(ha_page, scenario, ha=ha)
        run_assertions(ha_page, scenario)
    finally:
        run_interactions(ha_page, scenario, ha=ha, key="teardown")
        if theme:
            reset_theme(ha)
        clear_scenario(ha, ha_lovelace_url_path)
