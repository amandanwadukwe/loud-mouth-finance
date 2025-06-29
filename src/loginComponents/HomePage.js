// import React, { useState, useEffect } from 'react';
// import wick from '../resources/wick.svg';
// import piggyBank from '../resources/piggyBank.svg';
// import planner from '../resources/planner.svg'
// import { Outlet, Link } from 'react-router-dom';


// export const HomePage = () => {
//       const [loading, setLoading] = useState(true);
    
//     return (
        
//       <div className={loading ? 'pulse' : ''}>
//         {/* <Header /> */}
//         <div className="hero">
//           <span>Pushing the boundaries of tech to deliver</span>
//           <span className="fin-emph">Easy Finance</span>
//         </div>
//         <div className="main-menu" >
//           <div className="menu-img-container" ><img className="menu-img" src={wick} alt='' /><p>Investments</p></div>
//           <div className="menu-img-container" ><img className="menu-img" src={piggyBank} alt='' /><p><Link to="/planner">Planner</Link></p></div>
//           <div className="menu-img-container" ><img className="menu-img" src={planner} alt='' /><p> <Link to="/savings">Savings</Link></p></div>
//         </div>
//         </div>
//     );
//   };

import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import wick from '../resources/wick.svg';
import piggyBank from '../resources/piggyBank.svg';
import planner from '../resources/planner.svg';
import '../styles/HomePage.css'; // Assuming you'll create this CSS file

export const HomePage = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`home-container ${loading ? 'pulse' : ''}`}>
      <section className="hero-section">
        <div className="hero-content">
          <h1>Pushing the boundaries of tech to deliver <span className="fin-emph">Smart Finance</span></h1>
          <p className="hero-tagline">Personalized financial guidance powered by cutting-edge technology</p>
          <div className="hero-cta">
            <Link to="/plans" className="primary-btn">Get Started</Link>
            <Link to="/about" className="secondary-btn">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="services-section">
        <h2>Our Financial Services</h2>
        <p className="section-intro">Discover tools designed to help you achieve financial freedom</p>
        
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <img src={wick} alt="Investment icon" />
            </div>
            <h3>Smart Investments</h3>
            <p>Data-driven portfolio recommendations tailored to your risk profile and financial goals.</p>
            <Link to="/investments" className="service-link">Explore Investment Options</Link>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <img src={piggyBank} alt="Financial planner icon" />
            </div>
            <h3>Financial Planning</h3>
            <p>Comprehensive tools to map your journey toward financial independence and retirement security.</p>
            <Link to="/planner" className="service-link">Create Your Plan</Link>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <img src={planner} alt="Savings icon" />
            </div>
            <h3>Savings Strategies</h3>
            <p>Innovative approaches to maximize your savings rate and reach your financial milestones faster.</p>
            <Link to="/savings" className="service-link">Optimize Your Savings</Link>
          </div>
        </div>
      </section>
      
      <section className="trust-section">
        <h2>Trusted Financial Expertise</h2>
        <div className="trust-indicators">
          <div className="trust-item">
            <h4>10+ Years</h4>
            <p>Industry experience</p>
          </div>
          <div className="trust-item">
            <h4>50,000+</h4>
            <p>Satisfied clients</p>
          </div>
          <div className="trust-item">
            <h4>99.8%</h4>
            <p>Client retention</p>
          </div>
        </div>
      </section>
    </div>
  );
};