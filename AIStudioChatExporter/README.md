[简体中文](./README_CN.md)

# AI Studio Chat Exporter

A Firefox extension to export Google AI Studio conversations to HTML files.

## Features

- One-click export of AI Studio conversations
- Beautiful HTML output with preserved formatting
- Preserves code blocks, tables, lists, and other Markdown elements
- Supports images and media content
- Automatically skips "Thinking" panels and system instructions
- Auto-generates filename with date and conversation title

## Installation

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from this extension folder

## Usage

1. Open a conversation in [Google AI Studio](https://aistudio.google.com/)
2. Scroll to the top of chat
3. Click the AI Studio Chat Exporter icon in the toolbar
4. Click "导出对话" (Export Conversation)
5. The HTML file will be downloaded automatically

## File Structure

```
AIStudioChatExporter/
├── manifest.json          # Extension manifest
├── content/
│   └── content.js         # Content script for extracting conversations
├── popup/
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── icons/
│   └── icon.svg           # Extension icon
└── README.md              # This file
```

## Notes

- Only exports currently loaded content
- Thinking process panels are automatically excluded
- System instructions are automatically excluded
- Works with the latest AI Studio interface

## License

MIT License
