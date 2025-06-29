import React, { useState, useEffect } from 'react';
import wick from '../resources/wick.svg';
import piggyBank from '../resources/piggyBank.svg';
import planner from '../resources/planner.svg'
import EventInfo from './EventInfo.js';
import { ReactStocks } from "react-stocks";
import GeneralMarket from './GeneralMarket.js';
import SavingsSeries from './SavingsSeries.js';
import axios from 'axios';
import FinancialPlanner from './FinancialPlanner.js';
import Details from './Details.js';
import Verdict from './Verdict.js';

export const Main = () => {
    const [showInvestments, setShowInvestments] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [symbol, setSymbol] = useState('');
  const options = ['', 'AAPL','AMD','ANET','AVGO','DELL','HPE','NVDA','SMCI'];
  const bigMovers = ['NVDA', 'SMCI', 'AVGO','DELL' ];
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
        <main>

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
        <div className={showPlan ? "show" : "hide"}>
<FinancialPlanner/>

        </div>
      </main>
    )
}