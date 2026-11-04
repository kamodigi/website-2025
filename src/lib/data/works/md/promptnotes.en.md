## Why I made it

In Claude Code and Codex, pressing Enter while typing a prompt sends it to the AI on the spot. More than once, I have sent a half-written prompt by accident.

promptnotes is a dedicated editor for writing prompts before you send them to an AI. You can use Enter for line breaks without worry. It is an app for "drafting now and copying later" rather than sending, so it has no feature to call an AI.

All notes are saved as local `.md` files. They coexist with other tools, and you are free to take your data elsewhere.

## Choosing the tech

- **Tauri v2**: The foundation of the desktop app. It is distributed for macOS and Linux.
- **SvelteKit**: The UI is built with SvelteKit (static adapter), the same favorite framework as this site.
- **Rust**: Processing close to the OS, such as saving files and checking for updates, is written in Rust as Tauri commands.
- **CodeMirror 6**: Handles Markdown syntax highlighting and list and bracket completion.

## How I developed it with ori

I developed it with [ori](/works/ori), my own framework. First I wrote down in `idea.md` what I wanted to build and what must not be done. From there I used ori to create the DDD documents (`.ori/domain/`), and from then on treated those documents as the single source of truth.

In the documents, I split the app into four bounded contexts (note creation, feed, settings, and updates). Implementation proceeds slice by slice (note creation, autosave, updating search conditions, and so on), writing the tests first. When I want to change the spec, I edit the domain documents instead of the code and redo the affected slices.

## What I held to in the design

In `idea.md`, I wrote down what to protect at the very start. In particular, I listed mistakes the AI made in past implementations as things never to repeat.

- **Single pane only**: No sidebar. When AI hears "note app," it wants to build a sidebar plus main pane layout.
- **No app-name header**: The OS title bar is already there, so don't add a band with the same name beneath it.
- **Use the same rendering mechanism for preview and editing**: Switching between display HTML and an editing CodeMirror changes line heights and shifts coordinates. So CodeMirror is always shown, and you enter editing just by toggling `readOnly`.

Block state has only three values: IDLE (doing nothing), FOCUSED (selected with the keyboard), and EDITING (being edited). Because the state transitions are written in the documents, extra states are less likely to creep in.

## What was hard

- **Update notifications**: I had built the slice that checks for updates, but in v0.2.2 and v0.2.3 I forgot to wire it into the app's startup. Even when a new version came out, there was no notification and people had to replace the app by hand. In v0.2.4, I wired in a check at startup and every 24 hours.
- **Distribution on macOS**: I have not enrolled in the Apple Developer Program, so the app is not notarized. A Gatekeeper warning appears on first launch, so I documented the workaround in the README.
- **Pinning the toolchain**: The development environment is pinned with a Nix flake, but every dependency update required fixing the hashes.

## What's next

I will keep refining its day-to-day usability as a place to keep drafts before sending them to an AI. You can download it from [GitHub Releases](https://github.com/dev-komenzar/promptnotes/releases).
