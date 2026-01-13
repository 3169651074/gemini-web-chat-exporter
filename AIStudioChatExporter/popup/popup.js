// AI Studio Chat Exporter - Popup Script

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

  // 检查是否在 AI Studio 页面
  function isAIStudioPage(url) {
    return url && url.includes('aistudio.google.com');
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

      // 检查是否在 AI Studio 页面
      if (!isAIStudioPage(currentTab.url)) {
        throw new Error('请在 AI Studio 对话页面使用此扩展');
      }

      // 监听来自 content script 的进度消息
      const progressListener = (message) => {
        if (message.action === 'progress') {
          showStatus(`正在提取对话内容... (${message.count})`, 'loading');
        }
      };
      browser.runtime.onMessage.addListener(progressListener);

      // 发送消息到 content script
      const response = await browser.tabs.sendMessage(currentTab.id, {
        action: 'export'
      });

      // 移除监听器
      browser.runtime.onMessage.removeListener(progressListener);

      if (response && response.success) {
        showStatus('✓ 导出成功！共 ' + response.messageCount + ' 条消息', 'success');
        setButtonState(false, '导出对话');
      } else {
        const errorMsg = response ? response.error : '导出失败，请重试';
        
        // 增强的错误提示
        let enhancedError = errorMsg;
        if (errorMsg.includes('未找到对话内容')) {
          enhancedError = errorMsg + '\n💡 提示：请确保页面已完全加载，并在浏览器开发工具(F12)控制台查看诊断信息';
        } else if (errorMsg.includes('页面已完全加载')) {
          enhancedError = '页面可能未正确加载，请尝试刷新后重试';
        }
        
        throw new Error(enhancedError);
      }

    } catch (error) {
      console.error('Export error:', error);
      
      let errorMessage = error.message || '导出失败';
      
      // 处理特定错误
      if (error.message && error.message.includes('Receiving end does not exist')) {
        errorMessage = '请刷新 AI Studio 页面后重试';
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
      
      if (!currentTab || !isAIStudioPage(currentTab.url)) {
        showStatus('请在 aistudio.google.com 页面使用', 'error');
        setButtonState(true, '导出对话');
      }
    } catch (error) {
      console.error('Check page error:', error);
    }
  }

  checkCurrentPage();
})();
