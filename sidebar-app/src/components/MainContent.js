// import React from 'react';
// import { Route, Routes } from 'react-router-dom';
// import Home from '../pages/Home';
// import Page1 from '../pages/Page1';
// import Page2 from '../pages/Page2';
// import Page3 from '../pages/Page3';
// import Page4 from '../pages/Page4';
// import Page5 from '../pages/Page5';
// // 导入更多页面组件
// import './MainContent.css';

// const Content = () => {
//     return (
//         <div className="content">
//             <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/page1" element={<Page1 />} />
//                 <Route path="/page2" element={<Page2 />} />
//                 <Route path="/page3" element={<Page3 />} />
//                 <Route path="/page4" element={<Page4 />} />
//                 <Route path="/page5" element={<Page5 />} />
//                 {/* 添加更多路由 */}
//             </Routes>
//         </div>
//     );
// };

// export default Content;
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import DataPreview from '../pages/DataPreview';
import SelectColumns from '../pages/SelectColumns';
import UploadFeatures from '../pages/UploadFeatures';
import UploadLabels from '../pages/UploadLabels';
import ModelDisplay from '../pages/ModelDisplay';
import './MainContent.css';

const App = () => {
    return (
                <div className="content">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/data-preview" element={<DataPreview />} />
                <Route path="/select-columns"  element={<SelectColumns />} />
                <Route path="/upload-features" element={<UploadFeatures />} />
                <Route path="/upload-labels" element={<UploadLabels />} />
                <Route path="/model-display"  element={<ModelDisplay />} />
                {/* 添加更多路由 */}
            </Routes>
        </div>
        // <Router>
        //     <Sidebar />
        //     <Switch>
        //         <Route exact path="/" component={Home} />
        //         <Route path="/data-preview" component={DataPreview} />
        //         <Route path="/select-columns" component={SelectColumns} />
        //         <Route path="/upload-features" component={UploadFeatures} />
        //         <Route path="/upload-labels" component={UploadLabels} />
        //         <Route path="/model-display" component={ModelDisplay} />
        //     </Switch>
        // </Router>
    );
};

export default App;
