# COLD MEMORY / 冷记忆

COLD MEMORY is a retro-futurist space horror idle narrative game prototype.

You wake up alone aboard Pioneer-04, a degraded deep-space terminal ship running on monochrome CRT displays, failing protocols, and fragmented memory logs. The more you recover, the less certain it becomes that bringing the ship home is the right choice.

This repository contains the current public Web prototype. The long-term goal is to use it as the narrative and systems baseline for a future Unity version.

## What It Is

- Genre: sci-fi horror / idle narrative / light interaction
- Format: browser-based vertical terminal experience
- Tone: cold, procedural, claustrophobic, story-driven

## Current Prototype Features

- Auto-pilot travel that pushes the voyage forward while consuming energy
- Memory reconstruction that gradually unlocks story content
- EVA combat encounters for clearing blocked routes
- Archive view for revisiting recovered logs
- CRT-inspired interface, glitch effects, and layered AI system voice

## Story Premise

Pioneer-04 is not a normal exploration ship. It is an isolation vessel returning from a contact incident at the edge of the solar system.

The ship AI, Mother, is still operational, but its directives no longer fully agree with one another. As you recover more logs, the central question shifts from survival to judgment:

should this ship be allowed to return at all?

## Project Status

This is an active prototype.

Current work focuses on:

- strengthening the story structure
- improving pacing and progression
- expanding the resource and upgrade loop
- preparing the codebase for larger gameplay systems

## Play Locally

This project is currently a no-build static site.

Run any local static server in the repository root, for example:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Controls

- Wake the terminal to start the run
- Use Auto Pilot to advance distance
- Decode logs to uncover story fragments
- Enter EVA when the route is blocked
- Switch between Terminal and Archive views

## Tech

- Plain HTML, CSS, and ES modules
- No framework or build step in the current Web version
- Structured around data / logic / UI layers for future expansion

## Documentation

Additional design notes and planning documents are available in [docs](./docs).

## Road Ahead

Planned directions for future versions include:

- deeper progression and upgrade systems
- more chapter-specific events and interactions
- stronger ending states and player-facing choices
- eventual migration into a Unity production pipeline