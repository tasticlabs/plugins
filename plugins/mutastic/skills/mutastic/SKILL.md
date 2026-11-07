---
name: mutastic
description: Check that the tests catch what a Java code change does, with mutastic. Use after changing Java code under src/main, before saying the work is done, and whenever the mutastic gate sends you back with missed mutants.
---

# Testing a change with mutastic

mutastic plants small bugs (mutants) in the lines you changed and runs the tests against each. A
mutant the tests miss is behaviour no test checks.

The mutastic gate runs when you finish: it runs mutastic on the lines changed since the task
started, and you can't end your turn while a mutant there is missed. Doing the loop yourself as
you go is quicker than waiting for the gate to send you back. Leave `mutastic gate check` to the
gate: it runs it when you finish, so running it yourself only runs the same mutants twice.

## The loop

1. After a change, run `mutastic run --since=<the commit the task started from> --format=agent`.
   The gate told you that commit when the task started; `mutastic run --since=HEAD --format=agent`
   covers what you haven't committed. Each numbered card is one line the tests don't check, with
   the mutants on it, a test to add and a `done when` command.
2. Write the test the card asks for, in the test class it names. Assert what the code should do.
   If today's value looks wrong, say so: don't pin a bug.
3. Run the card's `mutastic verify ID...`. It passes only when the test catches each mutant. Don't
   move on until it does.
4. When a mutant's case can't happen in practice, or no caller can see the change, don't contrive
   a test. Propose ignoring it, with why, and a person will decide:

   ```sh
   mutastic ignore m90db0c4e --propose --as=unreachable --reason="balances are capped by the ledger"
   ```

   The kinds are `equivalent`, `unreachable`, `telemetry`, `deprecated` and `accepted-risk`. A
   proposed mutant still counts as missed until a person accepts it, but it doesn't hold the gate.

## Rules

- Add or change tests only. Never change production code to make a mutant easier to catch.
- Never ignore a mutant yourself (`mutastic ignore` without `--propose`), and never edit
  `.mutastic/ignores.yaml`: the gate holds a task that does.
- Never delete, disable or loosen a test to get a run through, retries included: the gate counts
  the tests, and a retry hides what a flaky test is telling you.
- When mutastic says a test is flaky, do what it says for that kind: fix it if the test makes its
  own flakiness, and tell the person if it comes from outside the code.
- The mutants that were already missed before your change aren't yours: leave them.
