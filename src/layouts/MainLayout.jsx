import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="wrap">
      {/* El Header aparece en todas las páginas que usen este Layout */}
      <Header />
      
      <main style={{ marginTop: '16px' }}>
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;