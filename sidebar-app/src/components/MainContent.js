import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Page1 from '../pages/Page1';
import Page2 from '../pages/Page2';
import Page3 from '../pages/Page3';
import Page4 from '../pages/Page4';
import Page5 from '../pages/Page5';
// 导入更多页面组件
import './MainContent.css';

const Content = () => {
    return (
        <div className="content">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/page1" element={<Page1 />} />
                <Route path="/page2" element={<Page2 />} />
                <Route path="/page3" element={<Page3 />} />
                <Route path="/page4" element={<Page4 />} />
                <Route path="/page5" element={<Page5 />} />
                {/* 添加更多路由 */}
            </Routes>
        </div>
    );
};

export default Content;
