#!/usr/bin/env python3
"""Stamp Phase 2B Kanban task bodies with Plan: first-line + agent plan file contents."""

from __future__ import annotations

import sqlite3
from pathlib import Path

PARENT_ID = "t_1249ee6d"
PLAN_PREFIX = ".hermes/plans/2026-05-20_174800-agent"
REPO_ROOT = Path(__file__).resolve().parents[1]
KANBAN_DB = Path.home() / ".hermes/kanban/boards/aegis-hackathon/kanban.db"

# task_id -> (wave letter or "—", plan slug)
TASK_MAP: dict[str, tuple[str, str]] = {
    "t_847a1d9f": ("A", "backend-rpc"),
    "t_be93a436": ("A", "backend-rpc"),
    "t_2dd8c634": ("A", "tx-decoder"),
    "t_7bdc7206": ("A", "policy-engine"),
    "t_6bec0d44": ("A", "adapter"),
    "t_1eb39523": ("B", "ai-memo"),
    "t_c62c7efb": ("B", "ai-memo"),
    "t_3d40341e": ("C", "frontend"),
    "t_3bd435a8": ("C", "frontend"),
    "t_921f1e76": ("C", "frontend"),
    "t_842636d0": ("D", "smart-contract"),
    "t_eab37456": ("D", "backend-rpc"),
    "t_481e57d1": ("D", "aegis-orchestrator"),
    "t_f0788160": ("D", "qa"),
    "t_1249ee6d": ("—", "aegis-orchestrator"),
}


def first_line(wave: str, slug: str) -> str:
    return f"Plan: {PLAN_PREFIX}-{slug}.md | Wave {wave} | Parent: {PARENT_ID}"


def load_plan(slug: str) -> str:
    path = REPO_ROOT / f"{PLAN_PREFIX}-{slug}.md"
    if not path.is_file():
        raise FileNotFoundError(path)
    return path.read_text(encoding="utf-8")


def main() -> None:
    if not KANBAN_DB.is_file():
        raise SystemExit(f"Kanban DB not found: {KANBAN_DB}")

    conn = sqlite3.connect(KANBAN_DB)
    updated = 0
    skipped = 0

    for task_id, (wave, slug) in TASK_MAP.items():
        row = conn.execute("SELECT body FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if row is None:
            print(f"SKIP missing task {task_id}")
            skipped += 1
            continue

        existing = row[0] or ""
        if existing.startswith("Plan:"):
            print(f"SKIP already stamped {task_id}")
            skipped += 1
            continue

        plan_text = load_plan(slug)
        body = f"{first_line(wave, slug)}\n\n{plan_text}"
        conn.execute("UPDATE tasks SET body = ? WHERE id = ?", (body, task_id))
        print(f"OK {task_id} wave={wave} slug={slug}")
        updated += 1

    conn.commit()
    conn.close()
    print(f"Done: updated={updated} skipped={skipped}")


if __name__ == "__main__":
    main()
