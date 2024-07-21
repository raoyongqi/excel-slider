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
                <NavLink to="/data-preview" activeClassName="active">数据预览</NavLink>
                <NavLink to="/select-table" activeClassName="active">选择子表</NavLink>
                <NavLink to="/select-columns" activeClassName="active">选取子列</NavLink>
                <div>
                    <div onClick={() => handleMenuClick('upload')} className="menu">
                        上传数据集 <span className="menu-arrow">&#9660;</span>
                    </div>
                    {openMenu === 'upload' && (
                        <div className="submenu">
                            <NavLink to="/upload-features" activeClassName="active">上传特征变量</NavLink>
                            <NavLink to="/upload-labels" activeClassName="active">上传标签变量</NavLink>
                        </div>
                    )}
                </div>
                <div>
                    <div onClick={() => handleMenuClick('boxplot')} className="menu">
                        箱线图展示 <span className="menu-arrow">&#9660;</span>
                    </div>
                    {openMenu === 'boxplot' && (
                        <div className="submenu">
                            <NavLink to="/boxplot-features" activeClassName="active">特征变量的箱线图</NavLink>
                            <NavLink to="/boxplot-labels" activeClassName="active">标签变量的箱线图</NavLink>
                        </div>
                    )}
                </div>
                <NavLink to="/model-display" activeClassName="active">模型下载和展示</NavLink>
            </div>
            <button className="toggle-button" onClick={toggleSidebar}>
                {isSidebarOpen ? '<<' : '>>'}
            </button>
        </div>
    );
};

export default Sidebar;
