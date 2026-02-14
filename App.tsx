
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ToolDetail } from './pages/ToolDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tool/:id" element={<ToolDetail />} />
          {/* Default Route for common shortcuts */}
          <Route path="/merge" element={<ToolDetail />} />
          <Route path="/split" element={<ToolDetail />} />
          <Route path="/compress" element={<ToolDetail />} />
          <Route path="/convert" element={<ToolDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
