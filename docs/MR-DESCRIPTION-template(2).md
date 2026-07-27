# MR Description Template (Ace — blueprint-aligned)

> **For developers:** copy everything below into the Gitea MR description before requesting review.
> Fill every section. If a section does not apply, write `N/A` + a one-line reason — do not delete it.
> Incomplete MR descriptions are sent back without review.
>
> **You don't hand-write this.** In the chat where you built the slice, ask the AI to fill this template
> from the **task file + your diff + your verification run** — then read it and confirm. The AI drafts;
> you own it.
>
> **Hard rule up front — the Task ID (§1) is mandatory** and must match a real file in `docs/tasks/`.
> The review gate (prompt 05) keys off it to find your task + its skeleton boxes. A **missing, unknown,
> or mismatched** Task ID is auto-rejected *before* any code is reviewed.

---

## 1. Title & Reference

- **MR Title:** `[<TASK ID>] <short description>`  <!-- e.g. [M05] email-parsing orchestration · [F07] output schema gate -->
- **Task ID:** `<M__ | F__>`  <!-- MUST match docs/tasks/<id>-*.md — this is what review keys off -->
- **Task file:** `docs/tasks/<TASK ID>-<slice>.md`
- **Story (feature only):** `docs/spec/stories/US-NN-*.md`  <!-- N/A for refactor -->
- **Branch:** `<migrate/M05-… | feat/F07-…>`  <!-- carry the Task ID in the branch name -->
- **Target Branch:** `<feature/code-migration / develop / main>`
- **Video walkthrough:** `<link>`  <!-- REQUIRED: the ≤5-min recording, in your own words — the task · the box's "don't put here" + WHY the ⚠️ values are kept · how you tested. See DEV-CHECKLIST.md. -->

## 2. Change Type

Pick one (delete the rest). The type sets how the rest is filled:

- [ ] **Refactor — `M__` (no behaviour change)** → §3 "Why" = move into target boxes, behaviour preserved; §5–9 mostly N/A; **§7 hooks MUST be N/A** (shim, not an edit); §10–12 = the differential + benchmark report.
- [ ] **Migration / Patch** (fixtures / schema move) → fill §5 / §6.
- [ ] **New Feature — `F__`** → fill §5–9 as the box's RETURN specified; §10–12 = functional scenarios from the story's acceptance.
- [ ] **DocType / Schema Change** → fill §5 / §6.
- [ ] **Bug Fix**
- [ ] **Hotfix (production)**

## 3. Summary — What & Why

<!-- 2–3 sentences, plain English. WHAT this MR does + WHY. Refactor: "move <old files> into <boxes>,
behaviour unchanged." Not "fixed the bug" / "added the feature." Be specific. -->

**What:**

**Why:**

## 4. Files Changed (→ which box)

One line per file: what changed + which target box it implements.

| File Path | What Changed | Box (from the task) |
|---|---|---|
| `ace/ace/services/email_parsing/classifier.py` | Filled classify / resolve-type / skip-checks | `classifier.py [M05]` |

## 5. DocType Changes
<!-- N/A for most refactors. -->
- **New DocTypes:** <!-- name + purpose (e.g. Ace AI Call Log, Parse Review, Ace Pipeline Breaker) -->
- **Modified DocTypes / Custom Fields (via fixtures, `module = Ace`):**
- **Property Setters:**

## 6. Database / Schema Impact
<!-- N/A if none. -->
- **New tables / columns / fields:**
- **Patches required:** <!-- patch path(s) -->
- **Reversible?** <!-- yes/no + how -->

## 7. Hooks & Background Jobs  ⚠️ refactor (`M__`) = N/A
<!-- For an M__ refactor slice this MUST be N/A — the boundary stays on the OLD path via a SHIM; you do
NOT edit hooks.py / routes / scheduler. Any change here on a refactor PR is auto-flagged by review. -->
- **hooks.py changes (doc_events / scheduler / override_doctype_class / route rules):**
- **Scheduled jobs added / modified:** <!-- name + frequency -->
- **Background job functions touched:**

## 8. Public Surface (whitelisted methods / routes / shim)
<!-- N/A if none. -->
- **New whitelisted methods / doors (feature only):** <!-- ONLY the door the box names -->
- **Shim left at the OLD dotted path (refactor):** <!-- old path → new home; the old symbol still resolves -->
- **Breaking API changes:** <!-- yes/no + details -->

## 9. Permission & Role Changes
<!-- N/A if none. -->
- **Role permissions / User permission rules:**
- **Any `ignore_permissions`:** <!-- where + why -->

## Verification (§10–12) — paste the ACTUAL report; this is what review audits

> **Refactor (`M__`):** paste the **"How to check your work" command + its per-scenario output** — every
> check green, the ⚠️ *preserve* and ✅ *must-fix* lines, and `benchmark == Phase-0 baseline`.
> **Feature (`F__`):** the functional scenarios proving the story's acceptance.
> Empty / vague = sent back. Review checks every scenario in the task is present and green.

### 10. Positive / happy-path (+ the run output)
```
<!-- paste the real run, e.g.
$ bench --site ace.local execute ace.migration_check.run --args "M05"
M05 — ✅ classifier 12/12 match | ✅ normalizer 9/9 match | ✅ prompt_builder 4/4 match
benchmark: extracted_data == baseline (53/53)
-->
```

### 11. Edge cases (incl. the ⚠️ preserve / ✅ must-fix lines)
1. <!-- ✅ rra11 last row: old crashes, new returns nothing — fixed -->
2. <!-- ⚠️ confidence preserved == old ~0.85 (not improved) -->

### 12. Negative / rejection scenarios
1. <!-- empty email body → log marked failed, no Project write -->

## 13. Known Limitations / Out of Scope
<!-- Be honest. "None." if none. -->

## 14. Breaking Changes
- [ ] Yes — impact + migration path below
- [ ] No

## 15. Rollback Plan
- **Revert by git revert?** <!-- yes/no -->
- **Refactor:** point the shim back at the old import.
- **Requires data / patch reversal?** <!-- yes/no + steps -->

## 16. Screenshots / Demo
<!-- UI → before/after; API → sample req/resp; backend-only → "Backend only — no UI." -->

## 17. Developer Pre-Submit Checklist

**General (all PRs):**
- [ ] Code follows Frappe v15 + Innogenio standards
- [ ] All verification in §10–12 actually executed and pasted (green)
- [ ] No hardcoded values — config / `model_config`; user text wrapped in `_()`
- [ ] No `ignore_permissions=True` without justification in §9
- [ ] No raw SQL string concatenation — Query Builder / parameterized only
- [ ] No `print()`; no commented-out code blocks left behind
- [ ] No bare `except:` — named exceptions only
- [ ] Events emitted per the box (with `trace_id`)
- [ ] I **read** the task + my box(es) + my stub, and **understand the verification** (per `DEV-CHECKLIST.md`)
- [ ] **≤5-min video recorded + linked in §1** — in my own words: the task · the box's "don't put here" + **why** the ⚠️ values are kept · how I tested (not the doc read aloud)
- [ ] I did **not** change any ⚠️ preserve, and did **not** touch files outside this task

**Refactor (`M__`) only — shim discipline:**
- [ ] `hooks.py` / routes / whitelisted paths / their JS callers **unchanged** (§7 = N/A)
- [ ] **Shim left at the old dotted path** → new home; old symbol still resolves (§8)
- [ ] **Old code not deleted** (deletion is the cleanup slice only)
- [ ] Behaviour matches the Phase-0 baseline (the differential / benchmark in §10–12)

**Feature (`F__`) only:**
- [ ] Only the new door the box/story names became public (§8)
- [ ] New doctype / events match the box's RETURN (§5 + `observability.md §2`)

---

**Developer:** <!-- name -->  ·  **Date:** <!-- YYYY-MM-DD -->
