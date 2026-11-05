// The mutastic gate for opencode: `mutastic gate open` when a session's first prompt arrives, and
// `mutastic gate check` when the session goes idle. opencode can't hold an agent's stop, so a check
// that isn't done sends the cards back as the next prompt; mutastic counts those, and after a few
// lets the agent stop and says what's left. As in the Claude Code plugin, it stays out of the way
// where the gate doesn't apply (not a git repository, no Java build, no mutastic) and never holds
// the agent when mutastic can't run: a gate that can't check holds nothing.
//
// Install: opencode plugin opencode-mutastic (add -g for every project).
import { spawn } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const BUILDS = ["pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"]
const INSTALL = "curl -fsSL https://mutastic.io/install.sh | sh"

/** What a command printed and how it exited; exit -1 when it couldn't start. */
function run(command, args, cwd, input = "") {
  return new Promise((resolve) => {
    let out = ""
    const child = spawn(command, args, { cwd, stdio: ["pipe", "pipe", "ignore"] })
    child.stdout.on("data", (chunk) => (out += chunk))
    child.on("error", () => resolve({ exit: -1, out: "" }))
    child.on("close", (exit) => resolve({ exit: exit ?? -1, out: out.trim() }))
    child.stdin.end(input)
  })
}

export const MutasticGate = async ({ client, worktree }) => {
  const project = worktree
  const mutastic = process.env.MUTASTIC || "mutastic"
  // The sessions the gate opened, with what the agent's told of it; and those that just stopped on
  // an error or an abort, whose idle isn't the agent saying it's done.
  const gated = new Map()
  const stopped = new Set()

  const applies = async () =>
    BUILDS.some((file) => existsSync(join(project, file))) &&
    (await run("git", ["rev-parse", "--verify", "-q", "HEAD"], project)).exit === 0

  /** The gate's answer as a Claude Code hook gives it, which says the session it's for. */
  const gate = (action, sessionID) =>
    run(mutastic, ["gate", action, project, "--hook=claude"], project, JSON.stringify({ session_id: sessionID }))

  const tell = (message, variant = "info") =>
    client.tui.showToast({ body: { message, variant } }).catch(() => {})

  // The mutastic skill, told to a gated session's agent with the gate's note. opencode reads skills
  // from its own directories, not reliably from a plugin's, so it comes in the system prompt, and
  // only where a task is gated.
  const skill = (() => {
    try {
      const file = join(dirname(fileURLToPath(import.meta.url)), "skills", "mutastic", "SKILL.md")
      return readFileSync(file, "utf8").replace(/^---[\s\S]*?---\s*/, "")
    } catch {
      return ""
    }
  })()

  const isSubtask = async (id) => {
    const session = await client.session.get({ path: { id } }).catch(() => null)
    return Boolean(session?.data?.parentID)
  }

  return {
    // Where the task starts, once a session, told to the agent in its next system prompt.
    "chat.message": async ({ sessionID }) => {
      stopped.delete(sessionID)
      if (!(await applies())) return
      const opened = await gate("open", sessionID)
      if (opened.exit === 0) {
        // Empty once the session's open: keep what it said the first time.
        gated.set(sessionID, opened.out || gated.get(sessionID) || "")
      } else if (opened.exit === -1) {
        await tell(`mutastic isn't installed, so this task isn't gated. To install it: ${INSTALL}`, "warning")
      } else {
        await tell(`This mutastic has no gate, so this task isn't gated: update it with ${INSTALL}`, "warning")
      }
    },
    "experimental.chat.system.transform": async ({ sessionID }, output) => {
      if (!sessionID || !gated.has(sessionID)) return
      const note = gated.get(sessionID)
      if (note) output.system.push(note)
      if (skill) output.system.push(skill)
    },
    event: async ({ event }) => {
      if (event.type === "session.error" && event.properties.sessionID) {
        stopped.add(event.properties.sessionID)
        return
      }
      if (event.type !== "session.idle") return
      const id = event.properties.sessionID
      if (stopped.delete(id) || !gated.has(id) || (await isSubtask(id))) return
      const checked = await gate("check", id)
      if (checked.exit !== 0 || !checked.out) {
        if (checked.exit !== 0) {
          await tell(`mutastic couldn't check the gate here (exit ${checked.exit}), so nothing was checked. Run mutastic gate check to see why.`, "warning")
        }
        return
      }
      const answer = JSON.parse(checked.out)
      if (answer.decision === "block") {
        await client.session.promptAsync({ path: { id }, body: { parts: [{ type: "text", text: answer.reason }] } })
      } else if (answer.systemMessage) {
        const passed = answer.systemMessage.includes("gate: passed")
        await tell(answer.systemMessage, passed ? "success" : "warning")
      }
    },
  }
}
