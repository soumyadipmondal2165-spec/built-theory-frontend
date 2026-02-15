import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
          <Route path="/merge" element={<Navigate to="/tool/merge" replace />} />
          <Route path="/split" element={<Navigate to="/tool/split" replace />} />
          <Route path="/compress" element={<Navigate to="/tool/compress" replace />} />
          <Route path="/convert" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
