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
          <h1>Pushing the boundaries of tech to deliver <span className="fin-emph" style={{color:'#f5a623'}}>Smart Finance</span></h1>
          <p className="hero-tagline">Empowering smarter money decisions through innovative technology</p>
          <div className="hero-cta">
            <Link to="/plans" className="primary-btn">Get Started</Link>
            <Link to="/about" className="secondary-btn">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="services-section">
        <h2>Our Financial Tools</h2>
        <p className="section-intro">Discover technology-driven solutions to help you work toward financial freedom</p>
        
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <img src={wick} alt="Investment icon" />
            </div>
            <h3>Smart Market</h3>
            <p>Data-informed tools to help you explore investment strategies aligned with your goals and comfort level, no advice, just intelligent insights.</p>
            <Link to="/market" className="service-link">Explore Investment Options</Link>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <img src={piggyBank} alt="Financial planner icon" />
            </div>
            <h3>Financial Planning</h3>
            <p>Map out your financial goals with our guided tools, from budgeting to long-term planning, built to support your journey to financial independence.</p>
            <Link to="/planner" className="service-link">Create Your Plan</Link>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <img src={planner} alt="Savings icon" />
            </div>
            <h3>Savings Strategies</h3>
            <p>Discover smart ways to boost your savings and stay on track with your financial goals — powered by data, not advice.</p>
            <Link to="/savings" className="service-link">Optimize Your Savings</Link>
          </div>
        </div>
      </section>
      
      <section className="trust-section">
        <h2>Financial freedom starts with awareness and the right tools</h2>
        <div className="trust-indicators">
          <div className="trust-item">
            <h4>Over 60%</h4>
            <p>of people feel anxious about money</p>
          </div>
          <div className="trust-item">
            <h4>Most adults</h4>
            <p>Satisfied clientsdon’t track their spending or budget consistently</p>
          </div>
          <div className="trust-item">
            <h4>Small improvements</h4>
            <p> in habits lead to big long-term gain</p>
          </div>
        </div>
      </section>
    </div>
  );
};