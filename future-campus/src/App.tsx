import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import {Login} from "./pages/login/Login.tsx";
import {Register} from "./pages/login/Register.tsx";
import {ForgotPassword} from "./pages/login/ForgotPassword.tsx";
import PageIndex from "./pages/article/PageIndex.tsx"
import {Publish} from "./pages/publish/Publish.tsx"
import {AIChat} from "./pages/aiChat/AIChat.tsx"
import ArticleDetail from "./pages/article/ArticleDetail.tsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login /> as ReactNode} />
        <Route path="/register" element={<Register /> as ReactNode} />
        <Route path="/forgot-password" element={<ForgotPassword /> as ReactNode} />
        <Route path="/" element={<Login /> as ReactNode} />
        <Route path="/campusList" element={<PageIndex /> as ReactNode} />
        <Route path="/publish" element={<Publish /> as ReactNode} />
        <Route path="/aiChat" element={<AIChat /> as ReactNode} />
        <Route path="/articleDetail" element={<ArticleDetail /> as ReactNode} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
