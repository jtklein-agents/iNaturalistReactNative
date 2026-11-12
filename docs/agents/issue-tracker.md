# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues on `jtklein-agents/iNaturalistReactNative` (the `origin` fork). Use the `gh` CLI for all operations. Pass `--repo jtklein-agents/iNaturalistReactNative` on every `gh` command. In this clone, `gh` with no `--repo` targets the upstream parent `inaturalist/iNaturalistReactNative`. File issues only on the fork.

## Conventions

- **Create an issue**: `gh issue create --repo jtklein-agents/iNaturalistReactNative --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --repo jtklein-agents/iNaturalistReactNative --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --repo jtklein-agents/iNaturalistReactNative --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --repo jtklein-agents/iNaturalistReactNative --parent <parent> ...`, or `gh issue edit <parent> --repo jtklein-agents/iNaturalistReactNative --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/jtklein-agents/iNaturalistReactNative/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, as in **Blocking** below). Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Blocking**: GitHub's **native issue dependencies**, the canonical, UI-visible representation. Add an edge with `gh issue create --repo jtklein-agents/iNaturalistReactNative --blocked-by <n>,<n> ...` or `gh issue edit <child> --repo jtklein-agents/iNaturalistReactNative --add-blocked-by <blocker>` (`gh` 2.94+). Older `gh`: `gh api --method POST repos/jtklein-agents/iNaturalistReactNative/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/jtklein-agents/iNaturalistReactNative/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Count open blockers**: `gh api repos/jtklein-agents/iNaturalistReactNative/issues/<n> --jq .issue_dependencies_summary.blocked_by` (open blockers only; 0 means startable). `gh issue view <n> --repo jtklein-agents/iNaturalistReactNative --json blockedBy` also lists closed blockers, so filter it: `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`.
- **Comment on an issue**: `gh issue comment <number> --repo jtklein-agents/iNaturalistReactNative --body "..."`.
- **Apply / remove labels**: `gh issue edit <number> --repo jtklein-agents/iNaturalistReactNative --add-label "..."` / `--remove-label "..."`.
- **Close**: post the explanation with `gh issue comment <number> --repo jtklein-agents/iNaturalistReactNative --body "..."`, then `gh issue close <number> --repo jtklein-agents/iNaturalistReactNative`. On an already-closed issue, `gh issue close --repo jtklein-agents/iNaturalistReactNative --comment` drops the comment and still exits 0.

File issues only on `jtklein-agents/iNaturalistReactNative`. Never file into `inaturalist/iNaturalistReactNative` or `mattpocock/skills`.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --repo jtklein-agents/iNaturalistReactNative`, then `gh pr view <number> --repo jtklein-agents/iNaturalistReactNative --comments` (off a TTY, `--comments` prints only the comments, not the body), and `gh pr diff <number> --repo jtklein-agents/iNaturalistReactNative` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/jtklein-agents/iNaturalistReactNative/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment <number> --repo jtklein-agents/iNaturalistReactNative --body "..."`, `gh pr edit <number> --repo jtklein-agents/iNaturalistReactNative --add-label "..."` / `--remove-label "..."`, `gh pr close <number> --repo jtklein-agents/iNaturalistReactNative`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42 --repo jtklein-agents/iNaturalistReactNative` and fall back to `gh issue view 42 --repo jtklein-agents/iNaturalistReactNative`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue on `jtklein-agents/iNaturalistReactNative`.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --repo jtklein-agents/iNaturalistReactNative --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a sub-issue of a parent**). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: see **Blocking** under Conventions.
- **Frontier query**: list the map's open children (`gh issue list --repo jtklein-agents/iNaturalistReactNative --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (see **Count open blockers**, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --repo jtklein-agents/iNaturalistReactNative --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> --repo jtklein-agents/iNaturalistReactNative --body "<answer>"`, then `gh issue close <n> --repo jtklein-agents/iNaturalistReactNative`, then append a context pointer (gist + link) to the map's Decisions-so-far.
