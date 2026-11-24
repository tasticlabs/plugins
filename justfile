# The plugins' verbs, one word each, as in mutastic's two editions: `just` lists them. A recipe is
# one line over npm or a script, so the words outlive the tool beneath. Publishing to npm is
# done by hand.

set minimum-version := "1.59.0"
set default-list
# A recipe's arguments reach its commands as "$@", each as it was typed: a glob or a space in one
# isn't split or expanded again.
set positional-arguments

# Turns on the commit message hook
[group('setup')]
setup:
    git config core.hooksPath .githooks

# Sets the mutastic plugin's version in its Claude Code and Codex manifests: just bump 0.4.0
[group('release')]
bump VERSION:
    python3 scripts/bump.py "$@"

# Packs the opencode plugin into opencode/, as npm would publish it
[group('release')]
[working-directory('opencode')]
pack:
    npm pack

# Merges a pull request once its checks pass: just merge 59 body.txt [--admin]
[group('merge')]
merge N *body:
    sh .githooks/merge-pr "$@"
