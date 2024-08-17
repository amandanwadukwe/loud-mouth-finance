import React, { useState } from 'react';
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
  const options = ['', 'NVDA', 'AAPL', 'AVGO'];
  const bigMovers = ['NVDA', 'AAPL', 'AVGO'];
  const [symbolXtraStep, setSymbolXtraStep] = useState('');


  // function getMajorEvent(){
  //   axios.get('http://localhost:5000')
  //   .then(res => {console.log(res.data);
  //     setEventName(res.data.next_big_event.event_name);
  //     setEventDate(res.data.next_big_event.event_date);
  //     setImpact(res.data.next_big_event.predicted_impact.description);
  //     setImpactStatus(res.data.next_big_event.predicted_impact.RAG_status);
  //   })
  //   .catch(err => console.log("err", err))
  //   }

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
        <div className="hero">
          <span>Pushing the boundaries of tech to deliver</span>
          <span className="fin-emph">Easy Finance</span>
        </div>
        <div>

        </div>
        <div className="main-menu" >
          <div className="menu-img-containter" onClick={() => makeInvestmentsVisible()}><img className="menu-img" src={wick} alt='' /><p>Investments</p></div>
          <div className="menu-img-containter" onClick={() => makePlanVisible()}><img className="menu-img" src={piggyBank} alt='' /><p>Plan</p></div>
          <div className="menu-img-containter" onClick={() => makeSavingsVisible()}><img className="menu-img" src={planner} alt='' /><p>Savings</p></div>
        </div>
        <div className={showInvestments ? "show" : "hide"} >
        <GeneralMarket />
        <div className="big-movers">
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
          <div className="health-checker">
            <span className="fin-emph">Health Check</span><br></br>
            <div className="search">
              <select onChange={e => setSymbolXtraStep(e.target.value)}>{options.map(opt => <option key={opt}>{opt}</option>)}</select><button onClick={() => setSymbol(symbolXtraStep)}>Launch Check</button>
            </div>
          </div>
          <Details symbol={symbol} />
          {/* <Verdict symbol={symbol} />
      <EventInfo symbol={symbol} /> */}
        </div>
        </div>
        <div className={showSavings ? "show" : "hide"}>
          <SavingsSeries />
        </div>
        <div className={showPlan ? "show" : "hide"}></div>
      </main>
      <footer></footer>
    </div>
  );
}

export default App;
