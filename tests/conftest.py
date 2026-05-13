"""Expander-card-specific pytest configuration.

Sets environment-variable defaults consumed by the ``ha_testcontainer``
pytest plugin so that tests run against a properly configured Home Assistant
instance with the expander card loaded.

All session-scoped HA container fixtures (``ha``, ``ha_url``, ``ha_token``,
``ha_lovelace_url_path``, ``ha_browser_context``, ``ha_page``) are provided
automatically by ``ha_testcontainer.pytest_plugin``, which is registered via
the ``pytest11`` entry-point and requires no explicit import.

Environment variables
---------------------
HA_VERSION
    Docker image tag to use.  Defaults to the version in ``tests/HA_VERSION``.
    Set to ``beta``, ``dev``, or a pinned version such as ``2024.6.0``.
HA_URL
    Base URL of a **pre-running** Home Assistant instance (e.g.
    ``http://localhost:12345``).  When set together with ``HA_TOKEN``, the
    test session connects to that instance instead of starting a new Docker
    container — eliminating the boot-time overhead for fast iterative work.
    Start a persistent instance with ``make ha_up``.
HA_TOKEN
    Long-lived access token for the pre-running HA instance.  Required when
    ``HA_URL`` is set.
HA_PLUGINS_YAML
    Path to an alternative ``plugins.yaml``.  Defaults to
    ``tests/plugins.yaml``.
"""

from __future__ import annotations

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Expander-card-specific env-var defaults — consumed by ha_testcontainer
# ---------------------------------------------------------------------------
# Set at module import time so they are visible to the session-scoped ``ha``
# fixture before it runs.  os.environ.setdefault() leaves any externally-set
# value (e.g. from ``source .ha_env``) unchanged.

_REPO_ROOT = Path(__file__).parent.parent
_HA_VERSION_FILE = _REPO_ROOT / "tests" / "HA_VERSION"

if "HA_VERSION" not in os.environ:
    try:
        ha_version = _HA_VERSION_FILE.read_text(encoding="utf-8").strip()
    except OSError as exc:
        raise RuntimeError(f"Failed to read default HA version from {_HA_VERSION_FILE}") from exc

    if not ha_version:
        raise RuntimeError(
            f"Default HA version file {_HA_VERSION_FILE} is empty or contains only whitespace. "
            "Populate tests/HA_VERSION with a non-empty Home Assistant version/tag, "
            "or set HA_VERSION explicitly to override it."
        )

    os.environ["HA_VERSION"] = ha_version

os.environ.setdefault("HA_CONFIG_PATH", str(_REPO_ROOT / "tests" / "ha-config"))  # NOSONAR
os.environ.setdefault("HA_PLUGINS_YAML", str(_REPO_ROOT / "tests" / "plugins.yaml"))  # NOSONAR
