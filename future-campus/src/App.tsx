import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {Login} from "./pages/login/Login.tsx";
import {Register} from "./pages/login/Register.tsx";
import {ForgotPassword} from "./pages/login/ForgotPassword.tsx";
import PageIndex from "./pages/article/PageIndex.tsx"
import Publish from "./pages/publish/Publish.tsx"
import {AIChat} from "./pages/aiChat/AIChat.tsx"
import ArticleDetail from "./pages/article/ArticleDetail.tsx"

// 路由守卫组件：检查 token 是否存在
function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token') || document.cookie.includes('token=');
  
  if (!token) {
    // 没有 token，跳转到登录页
    return <Navigate to="/login" replace />;
  }
  
  // 有 token，渲染子组件
  return <>{children}</>;
}

function App() {
  return (
      <>
    <BrowserRouter>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login /> as ReactNode} />
          <Route path="/register" element={<Register /> as ReactNode} />
          <Route path="/forgot-password" element={<ForgotPassword /> as ReactNode} />
          <Route path="/" element={<Login /> as ReactNode} />
          
          {/* 受保护的路由 - 需要 token */}
          <Route 
            path="/campusList" 
            element={
              <ProtectedRoute>
                <PageIndex />
              </ProtectedRoute> as ReactNode
            } 
          />
          <Route 
            path="/publish" 
            element={
              <ProtectedRoute>
                <Publish />
              </ProtectedRoute> as ReactNode
            } 
          />
          <Route 
            path="/aiChat" 
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute> as ReactNode
            } 
          />
          <Route 
            path="/articleDetail" 
            element={
              <ProtectedRoute>
                <ArticleDetail />
              </ProtectedRoute> as ReactNode
            } 
          />
        </Routes>
      </BrowserRouter>
      </>
  );
}

export default App;
