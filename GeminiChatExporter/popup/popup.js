// Gemini Chat Exporter - Popup Script

(function() {
  'use strict';

  const exportBtn = document.getElementById('exportBtn');
  const statusDiv = document.getElementById('status');

  // 显示状态信息
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
  }

  // 隐藏状态信息
  function hideStatus() {
    statusDiv.className = 'status';
    statusDiv.textContent = '';
  }

  // 设置按钮状态
  function setButtonState(disabled, text) {
    exportBtn.disabled = disabled;
    exportBtn.querySelector('.btn-text').textContent = text;
  }

  // 检查是否在 Gemini 页面
  function isGeminiPage(url) {
    return url && url.includes('gemini.google.com');
  }

  // 导出对话
  async function exportChat() {
    hideStatus();
    setButtonState(true, '正在导出...');
    showStatus('正在提取对话内容...', 'loading');

    try {
      // 获取当前标签页
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab) {
        throw new Error('无法获取当前标签页');
      }

      // 检查是否在 Gemini 页面
      if (!isGeminiPage(currentTab.url)) {
        throw new Error('请在 Gemini 对话页面使用此扩展');
      }

      // 发送消息到 content script
      const response = await browser.tabs.sendMessage(currentTab.id, {
        action: 'export'
      });

      if (response && response.success) {
        showStatus('✓ 导出成功！共 ' + response.messageCount + ' 条消息', 'success');
        setButtonState(false, '导出对话');
      } else {
        throw new Error(response ? response.error : '导出失败，请重试');
      }

    } catch (error) {
      console.error('Export error:', error);
      
      let errorMessage = error.message || '导出失败';
      
      // 处理特定错误
      if (error.message && error.message.includes('Receiving end does not exist')) {
        errorMessage = '请刷新 Gemini 页面后重试';
      }
      
      showStatus('✗ ' + errorMessage, 'error');
      setButtonState(false, '导出对话');
    }
  }

  // 绑定点击事件
  exportBtn.addEventListener('click', exportChat);

  // 页面加载时检查当前标签页
  async function checkCurrentPage() {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (!currentTab || !isGeminiPage(currentTab.url)) {
        showStatus('请在 gemini.google.com 页面使用', 'error');
        setButtonState(true, '导出对话');
      }
    } catch (error) {
      console.error('Check page error:', error);
    }
  }

  checkCurrentPage();
})();
