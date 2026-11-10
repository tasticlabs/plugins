# Contributing to the tasticlabs plugins

Thanks for helping. Bug reports, ideas and pull requests are all welcome: open an
[issue](https://github.com/tasticlabs/plugins/issues) or a pull request. The [README](README.md)
is what people read before installing, so a change to what a plugin does changes it too.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and 50/72:
a subject of at most 50 characters, a blank line, then a body wrapped at 72 that says why. The
diff already says what.

- **Subject:** `type(scope): summary`, in the imperative ("add", not "adds" or "added"), lower
  case after the colon unless it starts with a name, and with no full stop.
- **Type:** `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore` or
  `revert`. A breaking change adds `!` before the colon (`feat(cli)!: …`), or a
  `BREAKING CHANGE:` footer.
- **Scope:** optional and lower case, the part changed: `skill` (the mutastic skill), `propose` (the
  mutastic-propose skill), `gate`, `codex`, `opencode` or `marketplace`. Leave it out when a change
  spans several.
- **Body:** what was wrong or missing, and what the change does about it. URLs, indented or
  fenced code, and trailers such as `Co-Authored-By:` (last) may run past 72.

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
