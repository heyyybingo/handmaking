import { Routes, Route, Navigate } from 'react-router-dom';

/**
 * 根组件
 * 定义路由结构，包含登录页和后台管理布局
 * 后续各业务页面在对应模块中添加
 */
function App() {
  return (
    <Routes>
      {/* 登录页 */}
      <Route path="/login" element={<div>登录页（待实现）</div>} />

      {/* 管理后台布局 */}
      <Route path="/" element={<div>管理后台布局（待实现）</div>}>
        {/* 后续添加子路由：仪表盘、作品管理、分类管理等 */}
      </Route>

      {/* 未匹配路由重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
