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
from typing import Any

from playwright.sync_api import Page

import ha_testcontainer.visual.scenario_runner as _sr

_REPO_ROOT = Path(__file__).parent.parent.parent

_sr.SCENARIOS_DIR = Path(__file__).parent / "scenarios"
_sr.SNAPSHOTS_DIR = Path(__file__).parent / "snapshots"
_sr.REPO_ROOT = _REPO_ROOT
_sr.DOCS_SCENARIOS_DIR = _REPO_ROOT / "docs" / "scenarios"


# ---------------------------------------------------------------------------
# Custom assertion: trend_graph_rendered
# ---------------------------------------------------------------------------
# HA's trend-graph tile feature (and the hui-graph-base it renders) bake their
# SVG ``viewBox`` from ``clientWidth``/``clientHeight`` a single time and have no
# ResizeObserver.  When a child card renders while an expander is collapsed it is
# measured at 0x0, so the graph falls back to ``viewBox="0 0 500 100"`` and never
# recovers when shown — the graph is invisible.  This assertion fails if any
# trend-graph in the page still carries that broken zero-size geometry.
_TREND_GRAPH_PROBE_JS = r"""
() => {
  function* walk(root) {
    for (const el of root.querySelectorAll('*')) {
      yield el;
      if (el.shadowRoot) yield* walk(el.shadowRoot);
    }
  }
  const out = [];
  for (const el of walk(document)) {
    if (el.tagName && el.tagName.toLowerCase() === 'hui-trend-graph-card-feature') {
      const gb = el.shadowRoot && el.shadowRoot.querySelector('hui-graph-base');
      const svg = gb && gb.shadowRoot && gb.shadowRoot.querySelector('svg');
      out.push({
        entity: el.context && el.context.entity_id,
        gbWidth: gb ? gb.clientWidth : 0,
        viewBox: svg ? svg.getAttribute('viewBox') : null,
      });
    }
  }
  return out;
}
"""


def _assert_trend_graph_rendered(page: Page, assertion: dict[str, Any]) -> None:
    """Fail if any trend-graph has the broken zero-size fallback geometry."""
    __tracebackhide__ = True
    min_features = int(assertion.get("min_features", 1))
    graphs = page.evaluate(_TREND_GRAPH_PROBE_JS)
    assert len(graphs) >= min_features, (
        f"Expected at least {min_features} trend-graph feature(s), found {len(graphs)}: {graphs}"
    )
    broken = [g for g in graphs if g["gbWidth"] == 0 or g["viewBox"] == "0 0 500 100"]
    assert not broken, (
        "trend-graph(s) rendered with zero-size fallback geometry "
        f"(viewBox '0 0 500 100' / width 0) — graph would be invisible: {broken}"
    )


_sr.register_assertion_type("trend_graph_rendered", _assert_trend_graph_rendered)
