import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import {Login} from "./pages/login/Login.tsx";
import {Register} from "./pages/login/Register.tsx";
import PageIndex from "./pages/pageList/PageIndex.tsx"
import {Publish} from "./pages/publish/Publish.tsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login /> as ReactNode} />
        <Route path="/register" element={<Register /> as ReactNode} />
        <Route path="/" element={<Login /> as ReactNode} />
        <Route path="/campusList" element={<PageIndex /> as ReactNode} />
        <Route path="/publish" element={<Publish /> as ReactNode} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
