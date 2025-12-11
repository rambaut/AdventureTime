# Choose Your Own Adventure JSON Format

This document describes the format for the adventure JSON file used by the Choose Your Own Adventure web app. You can host your adventure JSON anywhere (local or remote) and load it into the app.


## Top-Level Structure

```json
{
  "stats": { ... },
  "start": "intro",
  "pages": { ... }
}
```

- `stats`: *(optional)* An object defining the initial values for any stats (e.g., `hunger`, `tiredness`, or string stats like `vibe`).
- `start`: The ID of the starting page.
- `pages`: An object mapping page IDs to page definitions.

---

## Page Object
Each entry in `pages` is a page object:

```json
"page_id": {
  "text": "Markdown text for this page.",
  "statChanges": { ... },
  "choices": [ ... ]
}
```

- `text`: *(required)* Markdown-formatted text to display for this page.
- `statChanges`: *(optional)* An object specifying stat changes applied when this page is entered.
- `choices`: *(optional)* An array of choice objects. If omitted or empty, the page is an ending.

---

## Choice Object
Each choice in a page's `choices` array is:

```json
{
  "text": "Button label",
  "target": "next_page_id",
  "explanation": "(optional) Markdown explanation shown next to the button.",
  "statChanges": { ... }
}
```

- `text`: *(required)* The label for the choice button.
- `target`: *(required)* The ID of the page to go to if this choice is selected.
- `explanation`: *(optional)* Markdown-formatted explanation shown next to the button.
- `statChanges`: *(optional)* Stat changes applied when this choice is selected.

---

## Example

```json
{
  "stats": { "hunger": 5, "tiredness": 5 },
  "start": "intro",
  "pages": {
    "intro": {
      "text": "# Welcome! Choose a path.",
      "choices": [
        { "text": "Go left", "target": "left_path", "statChanges": { "tiredness": -1 } },
        { "text": "Go right", "target": "right_path", "statChanges": { "hunger": -1 } }
      ]
    },
    "left_path": {
      "text": "You find a river.",
      "statChanges": { "tiredness": -1 },
      "choices": [
        { "text": "Swim", "target": "end", "statChanges": { "tiredness": -2 } }
      ]
    },
    "right_path": {
      "text": "You find a cave.",
      "choices": []
    },
    "end": {
      "text": "The End!",
      "choices": []
    }
  }
}
```

---


## Special Notes
- **Stats:** Any stat name can be used. Stats are displayed in the status panel. Stats can be numbers (for tracking things like `hunger` or `steps`) or strings (for things like `vibe`).
- **String Stats:** If a stat is a string (e.g., `"vibe": "slay"`), then a statChange to that stat will set it to a new string value. For example, `{ "vibe": "mid" }` will set the vibe to "mid".
- **Death Condition:** If any numeric stat (e.g., `hunger` or `tiredness`) reaches 0 or below, the game automatically redirects to a page with the ID `death` (which you should define in your JSON). String stats are never checked for death.
- **Markdown:** Both `text` and `explanation` fields support Markdown formatting.
- **Images:** You can use Markdown image syntax in `text` fields.

## Example

```json
{
  "stats": { "hunger": 5, "tiredness": 5, "vibe": "slay" },
  "start": "intro",
  "pages": {
    "intro": {
      "text": "# Welcome! Choose a path.\n\nYour vibe is currently **${vibe}**.",
      "choices": [
        { "text": "Go left", "target": "left_path", "statChanges": { "tiredness": -1, "vibe": "mid" } },
        { "text": "Go right", "target": "right_path", "statChanges": { "hunger": -1, "vibe": "based" } }
      ]
    },
    "left_path": {
      "text": "You find a river. Your vibe is **${vibe}**.",
      "statChanges": { "tiredness": -1 },
      "choices": [
        { "text": "Swim", "target": "end", "statChanges": { "tiredness": -2, "vibe": "sus" } }
      ]
    },
    "right_path": {
      "text": "You find a cave. Your vibe is **${vibe}**.",
      "choices": []
    },
    "end": {
      "text": "The End! Your final vibe: **${vibe}**.",
      "choices": []
    }
  }
}
```
