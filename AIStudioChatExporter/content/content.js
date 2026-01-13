// AI Studio Chat Exporter - Content Script
// 提取 AI Studio 对话内容并导出为 HTML 文件

(function() {
  'use strict';

  // 对话选择器配置（按优先级排序）- 适配 AI Studio
  const SELECTORS = {
    // 用户消息选择器
    userQuery: [
      'ms-text-chunk.user-chunk',
      '.user-chunk',
      '[data-message-author="user"]'
    ],
    // AI 回复选择器
    modelResponse: [
      'ms-text-chunk:not(.user-chunk)',
      '.model-response-container',
      '[data-message-author="model"]'
    ],
    // Markdown 内容选择器
    markdownContent: [
      'ms-cmark-node',
      '.markdown',
      '.markdown-content',
      '.response-content'
    ],
    // 用户消息文本选择器
    userText: [
      'ms-cmark-node',
      'p',
      'span',
      '.user-message-text'
    ],
    // 对话容器选择器
    container: [
      'ms-autoscroll-container',
      '.prompt-container',
      '.conversation-container',
      'main'
    ],
    // 需要跳过的元素（Thinking 面板等）
    skipElements: [
      'mat-expansion-panel:not([disabled])',
      '.thinking-panel',
      '.system-instructions',
      'ms-system-instructions-card'
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
        background: linear-gradient(135deg, #4285f4 0%, #a142f4 100%);
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
        border-left: 4px solid #a142f4;
        background: linear-gradient(to right, #fafafa, #fff);
      }
      
      .message.assistant .icon {
        background: linear-gradient(135deg, #4285f4, #a142f4);
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
      
      .message-content :not(pre) > code,
      .message-content .inline-code {
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
      
      /* KaTeX 数学公式基础样式 */
      .message-content .katex {
        font-size: 1.1em;
      }
      
      .message-content .katex-display {
        margin: 16px 0;
        overflow-x: auto;
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
      try {
        const element = parent.querySelector(selector);
        if (element) return element;
      } catch (e) {
        continue;
      }
    }
    return null;
  }

  // 使用选择器列表查找所有元素
  function querySelectorAll(parent, selectors) {
    for (const selector of selectors) {
      try {
        const elements = parent.querySelectorAll(selector);
        if (elements.length > 0) return Array.from(elements);
      } catch (e) {
        continue;
      }
    }
    return [];
  }

  // 提取用户消息内容（直接复制渲染后的 HTML）
  function extractUserContent(element) {
    // 尝试获取 ms-cmark-node 渲染后的内容
    const markdownElement = querySelector(element, SELECTORS.markdownContent);
    if (markdownElement) {
      const clone = markdownElement.cloneNode(true);
      cleanupClonedElement(clone);
      return clone.innerHTML;
    }
    
    // 尝试多种选择器获取文本内容
    const textElement = querySelector(element, SELECTORS.userText);
    if (textElement) {
      const clone = textElement.cloneNode(true);
      cleanupClonedElement(clone);
      return clone.innerHTML;
    }
    
    // 直接获取文本内容
    return element.textContent.trim();
  }

  // 提取 AI 回复内容（直接复制渲染后的 HTML）
  function extractAssistantContent(element) {
    // 尝试获取 markdown 渲染后的内容
    const markdownElement = querySelector(element, SELECTORS.markdownContent);
    if (markdownElement) {
      // 克隆并清理节点
      const clone = markdownElement.cloneNode(true);
      cleanupClonedElement(clone);
      return clone.innerHTML;
    }
    
    // 如果没有找到 markdown 容器，尝试获取整个回复内容
    const clone = element.cloneNode(true);
    cleanupClonedElement(clone);
    return clone.innerHTML;
  }

  // 清理克隆的元素（移除不需要的元素）
  function cleanupClonedElement(clone) {
    // 移除不需要的元素（如按钮、工具栏等）
    const removeSelectors = [
      'button',
      '.copy-button',
      '.toolbar',
      '.actions',
      '[aria-hidden="true"]',
      '.sr-only',
      '.cdk-visually-hidden',
      'mat-expansion-panel:not([disabled])', // 移除 Thinking 面板
      '.material-symbols-outlined' // 移除图标字体
    ];
    removeSelectors.forEach(sel => {
      try {
        clone.querySelectorAll(sel).forEach(el => el.remove());
      } catch (e) {
        // 忽略选择器错误
      }
    });
    
    // 移除 Angular 特定属性
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
      // 移除 _ngcontent 和 _nghost 属性
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('_ng') || attr.name.startsWith('ng-')) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }

  // 辅助函数：休眠
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 查找滚动容器
  function findScroller() {
    // 优先查找包含 ms-chat-turn 的 main 区域
    const turn = document.querySelector('ms-chat-turn');
    if (!turn) return document.documentElement;

    let el = turn.parentElement;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      // 检查是否有滚动条
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    
    // 如果找不到特定容器，返回文档根元素或 body
    return document.scrollingElement || document.documentElement;
  }

  // 提取单个 Turn 的内容
  function extractTurnData(turn, index) {
    try {
      // 获取 ID - 优先寻找稳定的 ID
      let turnId = turn.id;
      if (!turnId) {
        const chunk = turn.querySelector('ms-prompt-chunk[id], ms-response-chunk[id], ms-thought-chunk[id]');
        if (chunk) turnId = chunk.id;
      }
      
      // 克隆并清理
      const clone = turn.cloneNode(true);
      
      // 移除垃圾元素
      const trash = [
        '.actions-container',
        '.turn-footer',
        'button',
        'mat-icon',
        'ms-grounding-sources',
        'ms-search-entry-point',
        '.role-label',
        '.ms-role-tag',
        'svg',
        '.author-label',
        'ms-thought-chunk',  // 移除 Thinking
        'ms-system-instructions-card',
        '.material-symbols-outlined'
      ];
      trash.forEach(sel => {
        clone.querySelectorAll(sel).forEach(e => e.remove());
      });
      
      cleanupClonedElement(clone);

      // 提取纯文本用于生成指纹
      let plainText = clone.innerText
        .replace(/edit\s*more_vert/gi, '')
        .replace(/^\s*Model\s*/gm, '')
        .replace(/^\s*User\s*/gm, '')
        .trim();

      // 如果没有找到 ID，使用内容哈希作为临时 ID
      // 避免使用 index，因为滚动时 index 会变
      if (!turnId) {
        if (!plainText) return null; // 没内容也没ID，跳过
        // 简单的字符串哈希
        let hash = 0;
        for (let i = 0; i < plainText.length; i++) {
          const char = plainText.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        turnId = `content-hash-${hash}`;
      }

      // 角色判断
      let role = 'user';
      const roleIndicators = [
        '[data-turn-role="Model"]',
        '[data-turn-role="model"]',
        '[class*="model-prompt-container"]',
        'ms-response-chunk'
      ];
      if (roleIndicators.some(sel => turn.querySelector(sel))) {
        role = 'assistant';
      }

      // 提取内容 - 解决嵌套重复问题
      let htmlContent = '';
      
      const allCmarkNodes = Array.from(clone.querySelectorAll('ms-cmark-node'));
      
      if (allCmarkNodes.length > 0) {
        // 过滤掉嵌套的节点（只保留最外层的 ms-cmark-node）
        const topLevelNodes = allCmarkNodes.filter(node => {
          let parent = node.parentElement;
          while (parent && parent !== clone) {
            if (parent.tagName.toLowerCase() === 'ms-cmark-node') {
              return false; // 这是一个嵌套节点
            }
            parent = parent.parentElement;
          }
          return true;
        });

        // 如果有顶层节点，使用它们
        if (topLevelNodes.length > 0) {
           htmlContent = topLevelNodes.map(n => n.innerHTML).join('');
        } else {
           // 兜底：如果没有找到顶层节点（不太可能），或者结构奇怪，直接用 clone.innerHTML
           htmlContent = clone.innerHTML;
        }
      } else {
        htmlContent = clone.innerHTML;
      }
      
      if (!plainText && !htmlContent.includes('<img')) {
        return null;
      }

      return {
        id: turnId,
        role: role,
        content: htmlContent,
        text: plainText
      };
    } catch (e) {
      console.warn('Error extracting turn:', e);
      return null;
    }
  }

  // 异步获取完整对话（含滚动）
  async function extractConversationAsync() {
    const collectedData = new Map(); // id -> data
    const scroller = findScroller();
    console.log('Scroller found:', scroller);
    
    // 1. 尝试跳转到顶部
    // 查找侧边栏或顶部的导航按钮（如果有）- 参考 GhostXia 逻辑
    // 但为简化，我们先尝试直接滚动到顶部
    const initialScrollTop = scroller.scrollTop;
    scroller.scrollTop = 0;
    await sleep(500); // 等待渲染

    // 2. 循环滚动并采集
    // 每次滚动的距离
    const scrollStep = Math.min(window.innerHeight * 0.8, 800); 
    let lastScrollTop = -1;
    let unchangedCount = 0;
    const maxUnchanged = 3; // 连续 3 次位置不变则停止
    
    // 限制最大尝试次数防止死循环
    let loopCount = 0;
    const maxLoops = 200; 

    console.log('Starting scroll capture...');

    while (loopCount < maxLoops) {
      // 采集当前可见的 turns
      const turns = document.querySelectorAll('ms-chat-turn');
      turns.forEach((turn, idx) => {
        // 简单的可见性检查
        if (turn.offsetParent === null) return;
        
        const data = extractTurnData(turn, idx);
        if (data && !collectedData.has(data.id)) {
          collectedData.set(data.id, data);
          // console.log(`Collected turn ${data.id} (${data.role})`);
        }
      });

      // 检查是否到底
      const currentScrollTop = scroller.scrollTop;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      
      // 发送进度消息
      try {
        await browser.runtime.sendMessage({
          action: 'progress',
          count: collectedData.size
        });
      } catch (e) {
        // 忽略连接错误
      }

      if (Math.abs(currentScrollTop - lastScrollTop) < 5) {
        unchangedCount++;
        if (unchangedCount >= maxUnchanged) {
            // 尝试最后一次强力采集
            // break;
        }
      } else {
        unchangedCount = 0;
      }
      
      if (currentScrollTop >= maxScroll - 10 || unchangedCount >= maxUnchanged) {
        console.log('Reached bottom or stuck.');
        break;
      }

      lastScrollTop = currentScrollTop;
      scroller.scrollBy({ top: scrollStep, behavior: 'instant' }); // 使用 instant 更快
      await sleep(400); // 等待加载，稍微给点时间让 DOM 更新
      loopCount++;
    }

    // 恢复原来的滚动位置
    scroller.scrollTop = initialScrollTop;

    // 转换为数组并排序
    // 由于 Map 是按插入顺序的，而我们是从上往下滚动的，所以顺序大概率是对的。
    // 但是为了保险，我们还需要应对 DOM 重排。
    // 这里我们假设采集顺序大致就是对话顺序。
    // GhostXia 项目有复杂的排序逻辑 (updateTurnOrder)，我们这里简化处理：
    // 再次全量扫描一遍 DOM 获取最终 ID 顺序来排序 Map 中的数据
    
    // 如果没有采集到数据，直接返回空
    if (collectedData.size === 0) return [];
    
    // 尝试最后一次获取 DOM 元素，用于排序
    const finalTurns = Array.from(document.querySelectorAll('ms-chat-turn'));
    
    // 以 collectedData 为基准，如果是基于 Hash 的 ID，DOM重排也没法对上
    // 所以如果大多数 ID 是 Hash ID，我们就直接使用 collectedData 的顺序
    // 检查 ID 类型
    const ids = Array.from(collectedData.keys());
    const isHashIds = ids.some(id => id.startsWith('content-hash-'));
    
    if (isHashIds && finalTurns.length < collectedData.size * 0.8) {
       console.log('Using capture order (most IDs are content-hashed hashes or DOM nodes missing)');
       return Array.from(collectedData.values()).map(item => ({
            role: item.role,
            content: item.content
       }));
    }

    const orderedMessages = [];
    const seenIds = new Set();
    
    // 优先使用 DOM 顺序来排列已采集的数据
    finalTurns.forEach(turn => {
        let id = turn.id;
        if (!id) {
            const chunk = turn.querySelector('ms-prompt-chunk[id], ms-response-chunk[id]');
            if (chunk) id = chunk.id;
        }
        
        // 如果 DOM 节点没有 ID，尝试计算 Hash ID 来匹配（可能会很慢，且可能有偏差，略过）
        // 这里主要匹配那些有稳定 ID 的
        
        if (id && collectedData.has(id) && !seenIds.has(id)) {
            orderedMessages.push({
                role: collectedData.get(id).role,
                content: collectedData.get(id).content
            });
            seenIds.add(id);
        }
    });

    // 将 DOM 中未覆盖到的（比如因为虚拟滚动已被移除的顶部元素）
    // 通过 collectedData 补全。
    // 简单的策略：如果 orderedMessages 比 collectedData 少，且我们主要是靠有序采集的
    // 那就把 DOM 匹配不到的那些，按采集顺序找地方插进去？
    // 或者简单点：如果 DOM 覆盖率太低，直接回退到采集顺序
    
    if (orderedMessages.length < collectedData.size) {
        console.log(`DOM coverage low (${orderedMessages.length}/${collectedData.size}), falling back to capture order`);
        return Array.from(collectedData.values()).map(item => ({
            role: item.role,
            content: item.content
        }));
    }

    return orderedMessages;
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
    
    const title = getConversationTitle() || document.title || 'AI Studio 对话';
    
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
    <p>由 AI Studio Chat Exporter 导出 | ${dateStr}</p>
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
      // AI Studio 标题输入框
      () => document.querySelector('input[aria-label="Prompt title"]')?.value?.trim(),
      () => document.querySelector('.prompt-title input')?.value?.trim(),
      // 页面标题中的对话名
      () => {
        const pageTitle = document.title;
        if (pageTitle && pageTitle.includes(' | ')) {
          const title = pageTitle.split(' | ')[0].trim();
          if (title && title !== 'Google AI Studio') return title;
        }
        if (pageTitle && pageTitle.includes(' - ')) {
          const title = pageTitle.split(' - ')[0].trim();
          if (title && title !== 'Google AI Studio') return title;
        }
        return null;
      },
      // 其他可能的标题元素
      () => document.querySelector('[data-testid="prompt-title"]')?.textContent?.trim(),
      () => document.querySelector('.prompt-title')?.textContent?.trim(),
      () => document.querySelector('header h1')?.textContent?.trim(),
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
    
    const dateTime = `${year}${month}${day}`;
    
    // 尝试获取对话标题
    const title = getConversationTitle();
    const sanitizedTitle = sanitizeFilename(title);
    
    if (sanitizedTitle) {
      return `AIStudio-chat-${dateTime}-${sanitizedTitle}.html`;
    }
    
    return `AIStudio-chat-${dateTime}.html`;
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
  async function performExport() {
    try {
      console.log('=== Starting AI Studio Chat Export (Async Mode) ===');
      console.log('Page URL:', window.location.href);
      
      // 提取对话 (Async)
      const messages = await extractConversationAsync();
      
      console.log(`Extracted ${messages.length} messages`);
      
      if (messages.length === 0) {
        console.warn('No messages found even after scrolling.');
        return {
          success: false,
          error: '未找到对话内容，请确保页面已完全加载。'
        };
      }
      
      // 生成 HTML
      const html = generateHTML(messages);
      
      // 生成文件名
      const filename = generateFilename();
      
      console.log(`Generated filename: ${filename}`);
      
      // 下载文件
      downloadFile(html, filename);
      
      console.log('✓ Export completed successfully');
      
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
      performExport().then(result => {
        sendResponse(result);
      });
      return true; // 保持通道开启以进行异步响应
    }
    return false;
  });

  // 标记 content script 已加载
  console.log('AI Studio Chat Exporter: Content script loaded');
})();
