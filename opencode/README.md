# opencode-mutastic

[mutastic](https://mutastic.io) for [opencode](https://opencode.ai): mutation testing for Java and
Rust, checked while the agent is still in the code. It plants small bugs in the lines a task changed,
and the gate holds "done" until the tests catch them, handing the agent the test to write for
each one it misses.

```sh
opencode plugin opencode-mutastic        # for this project
opencode plugin opencode-mutastic -g     # for every project
```

It needs [mutastic](https://docs.mutastic.io/getting-started/install/) 1.0.0 or later, and a project
in git that mutastic reads (Java built with Gradle or Maven, or Rust built with Cargo); anywhere else it stays out of
the way. The docs say
more: [mutastic for opencode](https://docs.mutastic.io/agents/other-agents/).
