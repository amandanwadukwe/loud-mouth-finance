import React, { useState, useEffect } from 'react';
import wick from './resources/wick.svg';
import piggyBank from './resources/piggyBank.svg';
import planner from './resources/planner.svg'
import EventInfo from './components/EventInfo.js';
import { ReactStocks } from "react-stocks";
import GeneralMarket from './components/GeneralMarket.js';
import SavingsSeries from './components/SavingsSeries.js';
import axios from 'axios';

import Details from './components/Details.js';
import Verdict from './components/Verdict.js';
import './App.css';


function App() {
  const [showInvestments, setShowInvestments] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [symbol, setSymbol] = useState('');
  const options = ['', 'NVDA', 'AAPL', 'AVGO','TIA'];
  const bigMovers = ['NVDA', 'AAPL', 'AVGO','TIA'];
  const [symbolXtraStep, setSymbolXtraStep] = useState('');
  const [loading, setLoading] = useState(true);

  const handleSetSymbol = (data) => { setSymbol(data) };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);


  function makeInvestmentsVisible() {

    setShowInvestments(true);
    setShowPlan(false);
    setShowSavings(false)
  }

  function makePlanVisible() {
    setSymbol('');
    setShowInvestments(false);
    setShowPlan(true);
    setShowSavings(false)
  }

  function makeSavingsVisible() {
    setSymbol('');
    setShowInvestments(false);
    setShowPlan(false);
    setShowSavings(true)
  }


  return (
    <div>
      <header>
        <h1 className="logo">Finance</h1>
      </header>
      <main>
      <div className={loading ? 'pulse' : ''}>
        <div className="hero">
          <span>Pushing the boundaries of tech to deliver</span>
          <span className="fin-emph">Easy Finance</span>
        </div>
        </div>
        <div>

        </div>
        <div className="main-menu" >
          <div className="menu-img-container" onClick={() => makeInvestmentsVisible()}><img className="menu-img" src={wick} alt='' /><p>Investments</p></div>
          <div className="menu-img-container" onClick={() => makePlanVisible()}><img className="menu-img" src={piggyBank} alt='' /><p>Plan</p></div>
          <div className="menu-img-container" onClick={() => makeSavingsVisible()}><img className="menu-img" src={planner} alt='' /><p>Savings</p></div>
        </div>
        <div className={showInvestments ? "show" : "hide"} >
        <GeneralMarket symbol={symbol} />
        <div className={symbol.length <= 0 ? 'big-movers show' : 'big-movers hide'}>
          <span className="fin-emph" style={{ lineHeight: `10rem` }}>Big Movers</span>
          <div className="movers">
            {bigMovers.map(mover => {
              return <div className="mover"><ReactStocks doPoll tickers={[mover]} />&nbsp;<button onClick={() => {
                setSymbol(mover);
                setTimeout(() => {
                  setShowInvestments(true);
                  setShowPlan(false);
                  setShowSavings(false)
                }, 3000);

              }}>Launch Health Check</button></div>
            })}</div></div>
        <div>
          <div className={symbol.length <= 0 ? 'health-checker show' : 'health-checker hide'}>
            <span className="fin-emph">Health Check</span><br></br>
            <div className="search">
              <select onChange={e => setSymbolXtraStep(e.target.value)}>{options.map(opt => <option key={opt}>{opt}</option>)}</select><button onClick={() => setSymbol(symbolXtraStep)}>Launch Check</button>
            </div>
          </div>
          <Details symbol={symbol} sendData={handleSetSymbol} />
          {/* <Verdict symbol={symbol} />
      <EventInfo symbol={symbol} /> */}
        </div>
        </div>
        <div className={showSavings ? "show" : "hide"}>
          <SavingsSeries />
        </div>
        <div className={showPlan ? "show" : "hide"}></div>
      </main>
      <footer>
    <div className="main-div">
        <h2>Your Trusted Financial Advisor</h2>
        <p>
            Guiding you with expert advice tailored to your unique financial goals. Secure, reliable, and designed for the modern investor.
        </p>
        <p>
            Trusted Guidance | Clear Insights | Modern Expertise
        </p>
    </div>
</footer>

    </div>
  );
}

export default App;
