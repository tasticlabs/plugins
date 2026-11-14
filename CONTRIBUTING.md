# Contributing to the tasticlabs plugins

Thanks for helping. Bug reports, ideas and pull requests are all welcome: open an
[issue](https://github.com/tasticlabs/plugins/issues) or a pull request. The [README](README.md)
is what people read before installing, so a change to what a plugin does changes it too.

## Commit messages

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org) and 50/72: a
`type(scope): subject` of at most 50 characters, imperative and lower case, a blank line, then a
body wrapped at 72 that explains why: what was wrong or missing, and what the change does about it.

- **Subject:** no full stop at the end. Imperative means "add", not "adds" or "added".
- **Type:** `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore` or
  `revert`. A breaking change adds `!` before the colon (`feat(cli)!: …`), or a
  `BREAKING CHANGE:` footer.
- **Scope:** optional and lower case, the part changed: `skill` (the mutastic skill), `propose` (the
  mutastic-propose skill), `gate`, `codex`, `opencode` or `marketplace`. Leave it out when a change
  spans several.
- **Long lines:** URLs, indented or fenced code, and trailers such as `Co-Authored-By:` (last)
  may run past 72.

Two from the log, as they'd be written now:

```text
fix(gate): let mutastic decide what the gate holds

The gate script and the opencode plugin looked for pom.xml or a Gradle
file, so each would have needed a change for the Rust edition. Now they
ask mutastic, and stay quiet wherever it reads no build, so a build it
learns to read is gated with no plugin change.
```

```text
feat(codex): serve the mutastic plugin in Codex

Codex reads Claude Code plugins nearly as they are: the same skills,
hooks and hook answers. So one plugin serves both, and nothing about
the gate is copied: Codex gets its own manifest and marketplace file.
```

Commits before 9 Nov 2026 use the older style, a long subject that says why, and are not
rewritten.

`.githooks/commit-msg` checks each message as you commit, and lets merge, revert, `fixup!` and
`squash!` commits through as git writes them. Turn it on once in each clone:

```sh
git config core.hooksPath .githooks
```

CI runs the same check on each new commit in a push or pull request (`.githooks/check-commits`),
counting from the commit that added the hook. `sh .githooks/test-commit-msg` tests the hook.

A pull request is squash-merged, and GitHub writes its title and " (#<number>)" as the subject on
`main`, where the check counts the whole line. So the title follows the same rules with the
suffix counted: at most 44 characters for #10 to #99, 43 for #100 to #999. CI checks it
(`.githooks/check-title`), again whenever the title is edited, and says the limit for the pull
request's number.

Merge with `.githooks/merge-pr`, not `gh pr merge` by hand. It writes the subject from the title,
takes the body from a file (wrapped at 72) or leaves it empty, checks the whole message with
`commit-msg`, and merges only once every check has passed, on the commit they ran on. It deletes
the branch on GitHub and leaves local branches and worktrees alone. `--admin` merges without
waiting for the checks, for one that can't pass; the message is still checked.

```sh
sh .githooks/merge-pr 59            # subject "<title> (#59)", no body
sh .githooks/merge-pr 59 body.txt   # with a body that says why
```
