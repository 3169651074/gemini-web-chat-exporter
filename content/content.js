// Gemini Chat Exporter - Content Script
// 提取 Gemini 对话内容并导出为 HTML 文件

(function() {
  'use strict';

  // 对话选择器配置（按优先级排序）
  const SELECTORS = {
    // 用户消息选择器
    userQuery: [
      'user-query',
      '.user-query',
      '[data-message-author="user"]',
      '.query-text'
    ],
    // AI 回复选择器
    modelResponse: [
      'model-response',
      '.model-response',
      '[data-message-author="model"]',
      'message-content'
    ],
    // Markdown 内容选择器
    markdownContent: [
      '.markdown',
      '.markdown-content',
      'message-content .markdown',
      '.response-content'
    ],
    // 用户消息文本选择器
    userText: [
      '.query-text',
      '.query-text-line',
      'p',
      '.user-message-text'
    ],
    // 对话容器选择器
    container: [
      '.conversation-container',
      '#chat-history',
      '.chat-history',
      'infinite-scroller',
      'main'
    ]
  };

  // 生成导出 HTML 的样式
  function generateStyles() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
        line-height: 1.6;
        background: #f5f5f5;
        color: #333;
        padding: 20px;
      }
      
      .export-header {
        max-width: 900px;
        margin: 0 auto 24px;
        padding: 20px 24px;
        background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
        border-radius: 12px;
        color: white;
      }
      
      .export-header h1 {
        font-size: 24px;
        margin-bottom: 8px;
      }
      
      .export-header .meta {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .conversation {
        max-width: 900px;
        margin: 0 auto;
      }
      
      .message {
        padding: 20px 24px;
        margin-bottom: 16px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      
      .message-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        font-weight: 600;
        font-size: 14px;
      }
      
      .message-header .icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
      
      /* 用户消息样式 */
      .message.user {
        background: #e3f2fd;
        border-left: 4px solid #2196f3;
      }
      
      .message.user .icon {
        background: #2196f3;
        color: white;
      }
      
      .message.user .message-header {
        color: #1565c0;
      }
      
      /* AI 回复样式 */
      .message.assistant {
        background: #f5f5f5;
        border-left: 4px solid #9c27b0;
        background: linear-gradient(to right, #fafafa, #fff);
      }
      
      .message.assistant .icon {
        background: linear-gradient(135deg, #4285f4, #ea4335, #fbbc04, #34a853);
        color: white;
      }
      
      .message.assistant .message-header {
        color: #7b1fa2;
      }
      
      /* Markdown 内容样式 */
      .message-content {
        font-size: 15px;
        line-height: 1.7;
      }
      
      .message-content p {
        margin-bottom: 12px;
      }
      
      .message-content p:last-child {
        margin-bottom: 0;
      }
      
      .message-content h1,
      .message-content h2,
      .message-content h3,
      .message-content h4 {
        margin: 20px 0 12px;
        font-weight: 600;
      }
      
      .message-content h1 { font-size: 1.5em; }
      .message-content h2 { font-size: 1.3em; }
      .message-content h3 { font-size: 1.1em; }
      
      .message-content ul,
      .message-content ol {
        margin: 12px 0;
        padding-left: 24px;
      }
      
      .message-content li {
        margin-bottom: 6px;
      }
      
      .message-content li::marker {
        color: #666;
      }
      
      /* 代码块样式 - 深色背景 */
      .message-content pre {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 16px 0;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
      }
      
      .message-content code {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
      }
      
      .message-content :not(pre) > code {
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 4px;
        color: #c7254e;
      }
      
      .message-content pre code {
        background: transparent;
        padding: 0;
        color: inherit;
      }
      
      /* 表格样式 */
      .message-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        font-size: 14px;
      }
      
      .message-content th,
      .message-content td {
        border: 1px solid #ddd;
        padding: 10px 12px;
        text-align: left;
      }
      
      .message-content th {
        background: #f5f5f5;
        font-weight: 600;
      }
      
      .message-content tr:nth-child(even) {
        background: #fafafa;
      }
      
      /* 引用样式 */
      .message-content blockquote {
        border-left: 4px solid #ddd;
        margin: 16px 0;
        padding: 12px 20px;
        background: #fafafa;
        color: #666;
        font-style: italic;
      }
      
      /* 链接样式 */
      .message-content a {
        color: #1976d2;
        text-decoration: none;
      }
      
      .message-content a:hover {
        text-decoration: underline;
      }
      
      /* 分隔线 */
      .message-content hr {
        border: none;
        border-top: 1px solid #e0e0e0;
        margin: 20px 0;
      }
      
      /* 图片 */
      .message-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 12px 0;
      }
      
      /* 页脚 */
      .export-footer {
        max-width: 900px;
        margin: 24px auto 0;
        padding: 16px 24px;
        background: white;
        border-radius: 8px;
        text-align: center;
        font-size: 12px;
        color: #999;
      }
    `;
  }

  // 使用选择器列表查找元素
  function querySelector(parent, selectors) {
    for (const selector of selectors) {
      const element = parent.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  // 使用选择器列表查找所有元素
  function querySelectorAll(parent, selectors) {
    for (const selector of selectors) {
      const elements = parent.querySelectorAll(selector);
      if (elements.length > 0) return Array.from(elements);
    }
    return [];
  }

  // 提取用户消息内容
  function extractUserContent(element) {
    // 尝试多种选择器获取文本内容
    const textElement = querySelector(element, SELECTORS.userText);
    if (textElement) {
      return textElement.innerHTML;
    }
    // 直接获取文本内容
    return element.textContent.trim();
  }

  // 提取 AI 回复内容（保留 Markdown HTML）
  function extractAssistantContent(element) {
    // 尝试获取 markdown 渲染后的内容
    const markdownElement = querySelector(element, SELECTORS.markdownContent);
    if (markdownElement) {
      // 克隆并清理节点
      const clone = markdownElement.cloneNode(true);
      // 移除不需要的元素（如按钮、工具栏等）
      const removeSelectors = [
        'button',
        '.copy-button',
        '.toolbar',
        '[aria-hidden="true"]',
        '.sr-only'
      ];
      removeSelectors.forEach(sel => {
        clone.querySelectorAll(sel).forEach(el => el.remove());
      });
      return clone.innerHTML;
    }
    
    // 如果没有找到 markdown 容器，尝试获取整个回复内容
    const clone = element.cloneNode(true);
    // 移除头部/元信息等
    const removeSelectors = [
      'button',
      '.copy-button',
      '.toolbar',
      '.actions',
      '[aria-hidden="true"]'
    ];
    removeSelectors.forEach(sel => {
      clone.querySelectorAll(sel).forEach(el => el.remove());
    });
    return clone.innerHTML;
  }

  // 提取对话内容
  function extractConversation() {
    const messages = [];
    
    // 获取所有对话元素
    const allElements = document.body.querySelectorAll('*');
    const conversationElements = [];
    
    // 遍历查找用户消息和 AI 回复
    allElements.forEach(el => {
      const tagName = el.tagName.toLowerCase();
      if (tagName === 'user-query' || 
          tagName === 'model-response' ||
          el.matches('[data-message-author="user"]') ||
          el.matches('[data-message-author="model"]')) {
        conversationElements.push(el);
      }
    });
    
    // 如果找到了对话元素
    if (conversationElements.length > 0) {
      conversationElements.forEach(el => {
        const tagName = el.tagName.toLowerCase();
        const isUser = tagName === 'user-query' || 
                       el.matches('[data-message-author="user"]');
        
        if (isUser) {
          const content = extractUserContent(el);
          if (content && content.trim()) {
            messages.push({
              role: 'user',
              content: content
            });
          }
        } else {
          const content = extractAssistantContent(el);
          if (content && content.trim()) {
            messages.push({
              role: 'assistant',
              content: content
            });
          }
        }
      });
    }
    
    // 备用方案：尝试其他选择器
    if (messages.length === 0) {
      // 尝试查找用户消息
      const userQueries = querySelectorAll(document, SELECTORS.userQuery);
      const modelResponses = querySelectorAll(document, SELECTORS.modelResponse);
      
      userQueries.forEach((el, index) => {
        const content = extractUserContent(el);
        if (content && content.trim()) {
          messages.push({
            role: 'user',
            content: content,
            order: el.getBoundingClientRect().top
          });
        }
      });
      
      modelResponses.forEach((el, index) => {
        const content = extractAssistantContent(el);
        if (content && content.trim()) {
          messages.push({
            role: 'assistant',
            content: content,
            order: el.getBoundingClientRect().top
          });
        }
      });
      
      // 按页面位置排序
      messages.sort((a, b) => (a.order || 0) - (b.order || 0));
      messages.forEach(m => delete m.order);
    }
    
    return messages;
  }

  // 生成 HTML 文档
  function generateHTML(messages) {
    const now = new Date();
    const dateStr = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const title = document.title || 'Gemini 对话';
    
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - 导出</title>
  <style>${generateStyles()}</style>
</head>
<body>
  <div class="export-header">
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">
      <span>导出时间: ${dateStr}</span>
      <span> | </span>
      <span>共 ${messages.length} 条消息</span>
    </div>
  </div>
  
  <div class="conversation">
`;
    
    messages.forEach((msg, index) => {
      const isUser = msg.role === 'user';
      const roleClass = isUser ? 'user' : 'assistant';
      const roleName = isUser ? 'User' : 'Gemini';
      const icon = isUser ? '👤' : '✨';
      
      html += `    <div class="message ${roleClass}">
      <div class="message-header">
        <span class="icon">${icon}</span>
        <span class="role">${roleName}</span>
      </div>
      <div class="message-content">
        ${msg.content}
      </div>
    </div>
`;
    });
    
    html += `  </div>
  
  <div class="export-footer">
    <p>由 Gemini Chat Exporter 导出 | ${dateStr}</p>
  </div>
</body>
</html>`;
    
    return html;
  }

  // HTML 转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 获取对话标题
  function getConversationTitle() {
    // 尝试多种选择器获取对话标题
    const titleSelectors = [
      // 页面标题中的对话名（通常格式为 "对话名 - Gemini"）
      () => {
        const pageTitle = document.title;
        if (pageTitle && pageTitle.includes(' - ')) {
          const title = pageTitle.split(' - ')[0].trim();
          if (title && title !== 'Gemini') return title;
        }
        return null;
      },
      // 对话标题元素
      () => document.querySelector('[data-testid="conversation-title"]')?.textContent?.trim(),
      () => document.querySelector('.conversation-title')?.textContent?.trim(),
      () => document.querySelector('.chat-title')?.textContent?.trim(),
      // 侧边栏中当前选中的对话
      () => document.querySelector('[aria-selected="true"] .conversation-title')?.textContent?.trim(),
      () => document.querySelector('.selected .chat-title')?.textContent?.trim(),
      // 头部标题
      () => document.querySelector('header h1')?.textContent?.trim(),
      () => document.querySelector('header h2')?.textContent?.trim(),
    ];

    for (const selector of titleSelectors) {
      try {
        const title = selector();
        if (title && title.length > 0 && title.length < 100) {
          return title;
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  }

  // 清理文件名（移除不合法字符）
  function sanitizeFilename(name) {
    if (!name) return '';
    // 移除或替换文件名中不允许的字符
    return name
      .replace(/[<>:"/\\|?*]/g, '_')  // 替换 Windows 不允许的字符
      .replace(/\s+/g, '_')            // 空格替换为下划线
      .replace(/_+/g, '_')             // 多个下划线合并
      .replace(/^_|_$/g, '')           // 移除首尾下划线
      .substring(0, 50);               // 限制长度
  }

  // 生成文件名
  function generateFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    //const dateTime = `${year}${month}${day}-${hour}${minute}${second}`;
    const dateTime = `${year}${month}${day}`;
    
    // 尝试获取对话标题
    const title = getConversationTitle();
    const sanitizedTitle = sanitizeFilename(title);
    
    if (sanitizedTitle) {
      return `Gemini-chat-${dateTime}-${sanitizedTitle}.html`;
    }
    
    return `Gemini-chat-${dateTime}.html`;
  }

  // 下载文件
  function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 延迟释放 URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // 执行导出
  function performExport() {
    try {
      // 提取对话
      const messages = extractConversation();
      
      if (messages.length === 0) {
        return {
          success: false,
          error: '未找到对话内容，请确保页面已完全加载'
        };
      }
      
      // 生成 HTML
      const html = generateHTML(messages);
      
      // 生成文件名
      const filename = generateFilename();
      
      // 下载文件
      downloadFile(html, filename);
      
      return {
        success: true,
        messageCount: messages.length
      };
      
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: error.message || '导出过程中发生错误'
      };
    }
  }

  // 监听来自 popup 的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'export') {
      const result = performExport();
      sendResponse(result);
    }
    return true;
  });

  // 标记 content script 已加载
  console.log('Gemini Chat Exporter: Content script loaded');
})();
