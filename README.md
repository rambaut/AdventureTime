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

- `stats`: *(optional)* An object defining the initial values for any stats (e.g., `hunger`, `tiredness`).
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
- **Stats:** Any stat name can be used. Stats are displayed in the status panel and can be increased or decreased by pages or choices.
- **Death Condition:** If any stat (e.g., `hunger` or `tiredness`) reaches 0 or below, the game automatically redirects to a page with the ID `death` (which you should define in your JSON).
- **Markdown:** Both `text` and `explanation` fields support Markdown formatting.
- **Images:** You can use Markdown image syntax in `text` fields.

---

## Minimal Example

```json
{
  "start": "intro",
  "pages": {
    "intro": {
      "text": "# Hello! This is a minimal adventure.",
      "choices": [
        { "text": "Finish", "target": "end" }
      ]
    },
    "end": {
      "text": "The End!"
    }
  }
}
```

---

## Hosting
- The JSON file must be accessible via HTTP(S) and have CORS enabled if loaded from a different domain.
- For local demo, place `adventure.json` in the same directory as the app.

---

## Versioning
- This format is stable as of December 2025. Future versions may add features, but this structure will remain compatible.
