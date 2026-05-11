"""Expander card visual-test conftest — configure the ha_testcontainer scenario runner.

All Playwright and HA container fixtures (``ha_browser_context``, ``ha_page``,
``ha``, ``ha_url``, ``ha_token``, ``ha_lovelace_url_path``) are provided
automatically by the ``ha_testcontainer`` pytest plugin.

This file configures the path globals that ``ha_testcontainer.visual.scenario_runner``
exposes as module-level variables.  The assignment must happen at conftest
import time — before the test modules are collected and their module-level
calls to ``load_all_scenarios()`` / ``load_all_doc_image_scenarios()`` run.
"""

from __future__ import annotations

from pathlib import Path

import ha_testcontainer.visual.scenario_runner as _sr

_REPO_ROOT = Path(__file__).parent.parent.parent

_sr.SCENARIOS_DIR = Path(__file__).parent / "scenarios"
_sr.SNAPSHOTS_DIR = Path(__file__).parent / "snapshots"
_sr.REPO_ROOT = _REPO_ROOT
_sr.DOCS_SCENARIOS_DIR = _REPO_ROOT / "docs" / "scenarios"
