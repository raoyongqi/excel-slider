// // src/components/Page1.js
// import React from 'react';
// import FileUpload from '../components/FileUpload'; // 导入 FileUpload 组件

// const Page1 = () => {
//     return (
//         <div>
//             <h1>训练集数据上传</h1>
//             <p>请在这里上传训练集数据</p>
//             <FileUpload /> {/* 在页面中使用 FileUpload 组件 */}
//         </div>
//     );
// };

// export default Page1;

import React, { useState } from 'react';
import './Page1.css';
import FileUpload from '../components/FileUpload';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Excel Upload App</h1>
            </header>
            <main>
                <FileUpload />
            </main>
        </div>
    );
}

export default App;
