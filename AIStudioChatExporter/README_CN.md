[Englich](./README.md)

# AI Studio Chat Exporter

一个用于导出 Google AI Studio 对话到 HTML 文件的 Firefox 扩展。

## 功能特性

- 一键导出 AI Studio 对话
- 美观的 HTML 输出，保留格式
- 保留代码块、表格、列表等 Markdown 元素
- 支持图片和媒体内容
- 自动跳过"思考过程"面板和系统指令
- 自动生成带日期和对话标题的文件名

## 安装方法

1. 打开 Firefox，访问 `about:debugging`
2. 点击左侧的"此 Firefox"
3. 点击"临时载入附加组件"
4. 选择此扩展文件夹中的 `manifest.json` 文件

## 使用方法

1. 在 [Google AI Studio](https://aistudio.google.com/) 中打开一个对话
2. 滚动到对话的最顶部
3. 点击工具栏中的 AI Studio Chat Exporter 图标
4. 点击"导出对话"按钮
5. HTML 文件将自动下载

## 文件结构

```
AIStudioChatExporter/
├── manifest.json          # 扩展清单
├── content/
│   └── content.js         # 内容脚本，用于提取对话
├── popup/
│   ├── popup.html         # 弹出窗口 UI
│   ├── popup.css          # 弹出窗口样式
│   └── popup.js           # 弹出窗口逻辑
├── icons/
│   └── icon.svg           # 扩展图标
└── README_CN.md           # 本文件
```

## 注意事项

- 仅导出当前已加载的内容
- 自动排除思考过程面板
- 自动排除系统指令
- 适配最新的 AI Studio 界面

## 许可证

MIT License
