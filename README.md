# Gemini Chat Exporter

一键导出 Gemini 对话内容为 HTML 文件的 Firefox 浏览器扩展。  
**导出前，需要手动上滑以加载完整对话到网页中**

## 功能特点

- 一键导出当前 Gemini 对话
- 生成美观的 HTML 文件，保留 Markdown 格式
- 用户消息和 AI 回复使用不同背景色区分
- 代码块使用深色背景样式
- 响应式设计，支持多种设备查看
- 完全本地运行，不上传任何数据
- 无第三方依赖

## 使用方法

### 安装插件

1. 从Release页面下载插件的Zip包并解压
2. 打开about:debugging，点击“此Firefox”，临时加载附加组件
3. 在打开的文件选择器中选择插件的`manifest.json`
4. 若对插件进行了修改，需要点击“重载”

### 导出对话

1. 打开 [Gemini](https://gemini.google.com/) 并进入一个对话
2. 确保对话内容已完全加载
3. 点击浏览器工具栏中的扩展图标
4. 点击 **"导出对话"** 按钮
5. 选择保存位置，完成导出

## 导出文件说明

插件直接复制Gemini对话的完整Markdown HTML，无本地渲染逻辑，保留原本对话格式。  
导出的 HTML 文件包含：

- 对话标题和导出时间
- 用户提示词（蓝色背景）
- Gemini 回复（灰色渐变背景）
- 完整的 Markdown 渲染效果
  - 代码块（深色背景）
  - 表格（带边框）
  - 列表（有序/无序）
  - 引用块
  - 链接
  - ...

文件命名格式：`Gemini-chat-YYYYMMDD.html`

## 限制

1. **仅导出已加载内容**：长对话需要先滚动加载全部内容
2. **页面结构变化**：如果 Google 更新 Gemini 界面，可能需要更新选择器
3. **图片处理**：导出的 HTML 中图片使用原始链接

## 项目结构

```
GeminiChatExporter/
├── manifest.json         # 扩展配置文件
├── icons/
│   └── icon.svg          # 扩展图标
├── popup/
│   ├── popup.html        # 弹窗界面
│   ├── popup.css         # 弹窗样式
│   └── popup.js          # 弹窗逻辑
├── content/
│   └── content.js        # 内容脚本（核心导出逻辑）
└── README.md             # 说明文档
```

## 技术说明

- **Manifest 版本**: V2
- **权限要求**:
  - `activeTab`: 访问当前标签页
  - `downloads`: 触发文件下载
- **无第三方依赖**: 原生 JavaScript 实现

## 许可证

MIT License
