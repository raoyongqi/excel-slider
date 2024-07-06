import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
//数据分析的训练集一般包括啥，自变量和因变量可不可以分别储存


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
                        上传 <span className="menu-arrow">&#9660;</span>
                    </div>
                    {openMenu === 'menu1' && (
                        <div className="submenu">
                            <NavLink to="/page1" activeClassName="active">上传训练集</NavLink>
                            <NavLink to="/page3" activeClassName="active">上传预测集</NavLink>
                        </div>
                    )}
                </div>
                <div>
                    <div onClick={() => handleMenuClick('menu2')} className="menu">
                        数据分析 <span className="menu-arrow">&#9660;</span>
                    </div>
                    {openMenu === 'menu2' && (
                        <div className="submenu">
                            <NavLink to="/page2" activeClassName="active">训练集数据分析</NavLink>
                            <NavLink to="/page4" activeClassName="active">预测集分析</NavLink>
                        </div>
                    )}
                </div>
                <NavLink to="/page5" activeClassName="active">修改模型</NavLink>
            </div>
            <button className="toggle-button" onClick={toggleSidebar}>
                {isSidebarOpen ? '<<' : '>>'}
            </button>
        </div>
    );
};

export default Sidebar;
