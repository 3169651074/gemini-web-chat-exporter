[简体中文](./README_CN.md)

# Gemini Chat Exporter

A Firefox browser extension to export Gemini conversations as HTML files with one click.  
**Before exporting, manually scroll up to load the complete conversation into the webpage.**

## Features

- One-click export of current Gemini conversation
- Generate beautiful HTML files with Markdown formatting preserved
- User messages and AI replies distinguished by different background colors
- Code blocks styled with dark background
- Responsive design supporting multiple devices
- Runs completely locally without uploading any data
- No third-party dependencies

## Usage

### Installing the Extension

1. Download and extract the extension zip file from the Release page
2. Open about:debugging and click "This Firefox", then temporarily load an add-on
3. Select the extension's `manifest.json` file in the file picker
4. If you modify the extension, click "Reload" to apply changes

### Exporting Conversations

1. Open [Gemini](https://gemini.google.com/) and enter a conversation
2. Ensure the conversation content is fully loaded
3. Click the extension icon in the browser toolbar
4. Click the **"Export Conversation"** button
5. Choose a save location to complete the export

## Exported File Details

The extension directly copies the complete Markdown HTML from Gemini conversations without local rendering logic, preserving the original conversation format.  
The exported HTML file includes:

- Conversation title and export time
- User prompts (blue background)
- Gemini replies (gray gradient background)
- Complete Markdown rendering effects
  - Code blocks (dark background)
  - Tables (with borders)
  - Lists (ordered/unordered)
  - Quote blocks
  - Links
  - ...

File naming format: `Gemini-chat-YYYYMMDD.html`

## Limitations

1. **Only exports loaded content**: Long conversations need to be fully scrolled and loaded first
2. **Page structure changes**: If Google updates the Gemini interface, selectors may need updating
3. **Image handling**: Images in exported HTML use original links

## Project Structure

```
GeminiChatExporter/
├── manifest.json         # Extension configuration file
├── icons/
│   └── icon.svg          # Extension icon
├── popup/
│   ├── popup.html        # Popup interface
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
├── content/
│   └── content.js        # Content script (core export logic)
└── README.md             # Documentation
```

## Technical Details

- **Manifest Version**: V2
- **Permissions required**:
  - `activeTab`: Access the current tab
  - `downloads`: Trigger file downloads
- **No third-party dependencies**: Implemented in vanilla JavaScript

## License

MIT License
