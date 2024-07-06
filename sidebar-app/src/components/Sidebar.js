import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openMenu, setOpenMenu] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleMenuClick = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    return (
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-content">
                <NavLink exact to="/" activeClassName="active">首页</NavLink>
                <div>
                    <div onClick={() => handleMenuClick('menu1')} className="menu">
                        上传特征变量 <span className="menu-arrow">&#9660;</span>
                    </div>
                    {openMenu === 'menu1' && (
                        <div className="submenu">
                            <NavLink to="/page1" activeClassName="active">上传特征变量</NavLink>
                            <NavLink to="/page2" activeClassName="active">上传标签变量</NavLink>
                        </div>
                    )}
                </div>
                <div>
                    <div onClick={() => handleMenuClick('menu2')} className="menu">
                        数据处理 <span className="menu-arrow">&#9660;</span>
                    </div>
                    {openMenu === 'menu2' && (
                        <div className="submenu">
                            <NavLink to="/page3" activeClassName="active">拆分数据集</NavLink>
                        </div>
                    )}
                </div>
                <NavLink to="/page4" activeClassName="active">随机森林结果输出</NavLink>
                <NavLink to="/page5" activeClassName="active">上传测试数据</NavLink>
            </div>
            <button className="toggle-button" onClick={toggleSidebar}>
                {isSidebarOpen ? '<<' : '>>'}
            </button>
        </div>
    );
};

export default Sidebar;
