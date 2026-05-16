/**
 * 首次互动拦截工具
 * 当用户未完善个人信息时，弹出完善信息面板
 * 完成后继续执行原操作
 */

let _pendingCallback = null;

/**
 * 检查是否需要拦截互动
 * @param {Function} callback 通过检查后执行的回调
 * @returns {boolean} 是否被拦截
 */
function checkIntercept(callback) {
  const app = getApp();

  if (!app.globalData.token) {
    wx.showToast({ title: '请先登录', icon: 'none' });
    return true;
  }

  if (!app.globalData.hasProfile) {
    _pendingCallback = callback;
    return true;
  }

  return false;
}

/**
 * 获取待执行的回调（供页面使用）
 */
function getPendingCallback() {
  return _pendingCallback;
}

/**
 * 执行回调并清空
 */
function executePending() {
  if (_pendingCallback) {
    const cb = _pendingCallback;
    _pendingCallback = null;
    cb();
    return true;
  }
  return false;
}

/**
 * 取消待执行的回调
 */
function cancelPending() {
  _pendingCallback = null;
}

module.exports = {
  checkIntercept,
  getPendingCallback,
  executePending,
  cancelPending,
};
