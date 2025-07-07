import React, { useState, useEffect } from 'react';
import { ReactStocks } from "react-stocks";
import SavingsSeries from './SavingsSeries.js';
import axios from 'axios';
import FinancialPlanner from './FinancialPlanner.js';
import Details from './Details.js';
import GeneralMarket from './GeneralMarket.js'; // Import for GeneralMarket
import '../styles/Main.css';

export const Main = () => {
  // State management
  const [showInvestments, setShowInvestments] = useState(true);
  const [showPlan, setShowPlan] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [symbolXtraStep, setSymbolXtraStep] = useState('');
  const [loading, setLoading] = useState(true);
  const [marketSentiment, setMarketSentiment] = useState('bullish'); // Set to bullish to match example
  const [showGeneralMarket, setShowGeneralMarket] = useState(false); // Toggle for GeneralMarket visibility

  // Stock options and big movers
  const options = ['', 'AAPL','AMD','ANET','AVGO','DELL','HPE','NVDA','SMCI'];
  const bigMovers = ['NVDA', 'SMCI', 'AVGO','DELL'];

  const handleSetSymbol = (data) => { setSymbol(data) };

  useEffect(() => {
    // Initialize component
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds loading time

    // Cleanup function
    return () => clearTimeout(timer);
  }, []);

  // Market data for demo
  const marketData = {
    dowJones: { value: '36,245.50', change: 0.85, isUp: true },
    sp500: { value: '4,839.15', change: 0.57, isUp: true },
    nasdaq: { value: '15,451.31', change: -0.28, isUp: false }
  };

  // Tooltip descriptions
  const tooltips = {
    market: "The Market Right Now section shows a snapshot of current market conditions and major indices.",
    dowJones: "The Dow Jones Industrial Average tracks 30 large, publicly-owned blue-chip companies trading on the NYSE and NASDAQ.",
    sp500: "The S&P 500 is a stock market index tracking the stock performance of 500 large companies listed on stock exchanges in the United States.",
    nasdaq: "The NASDAQ Composite is a stock market index that includes almost all stocks listed on the Nasdaq stock exchange.",
    sentiment: "Market sentiment indicates the overall attitude of investors toward a particular security or financial market.",
    fear: "Fear sentiment suggests investors are selling and market prices may be undervalued.",
    neutral: "Neutral sentiment suggests a balanced market with no strong directional bias.",
    greed: "Greed sentiment suggests investors are buying heavily and market prices may be overvalued."
  };

  const toggleMarketView = () => {
    setShowGeneralMarket(!showGeneralMarket);
  };

  return (
    <main>
      <div className="show">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {/* Market View Toggle Button */}
            <button 
              className="market-toggle-button"
              onClick={toggleMarketView}
              title="Toggle between simplified and detailed market views"
            >
              {showGeneralMarket ? "Switch to Summary View" : "Switch to Detailed View"}
            </button>

            {/* Main Market Overview */}
            {!showGeneralMarket && (
              <div className="market-overview" title={tooltips.market}>
                <div className="market-header">
                  <h2>Market Right Now</h2>
                  <div 
                    className={`market-pulse ${marketSentiment}`} 
                    title={tooltips.sentiment}
                  >
                    {marketSentiment === 'bullish' ? 'Bull Market' : 
                    marketSentiment === 'bearish' ? 'Bear Market' : 'Neutral Market'}
                  </div>
                </div>
                
                <div className="market-indices">
                  <div 
                    className={`index-card ${marketData.dowJones.isUp ? 'up' : 'down'}`}
                    title={tooltips.dowJones}
                  >
                    <div className="index-name">Dow Jones</div>
                    <div className="index-value">{marketData.dowJones.value}</div>
                    <div className={`index-change ${marketData.dowJones.isUp ? 'positive' : 'negative'}`}>
                      {marketData.dowJones.isUp ? '+' : ''}{marketData.dowJones.change}%
                    </div>
                  </div>
                  
                  <div 
                    className={`index-card ${marketData.sp500.isUp ? 'up' : 'down'}`}
                    title={tooltips.sp500}
                  >
                    <div className="index-name">S&P 500</div>
                    <div className="index-value">{marketData.sp500.value}</div>
                    <div className={`index-change ${marketData.sp500.isUp ? 'positive' : 'negative'}`}>
                      {marketData.sp500.isUp ? '+' : ''}{marketData.sp500.change}%
                    </div>
                  </div>
                  
                  <div 
                    className={`index-card ${marketData.nasdaq.isUp ? 'up' : 'down'}`}
                    title={tooltips.nasdaq}
                  >
                    <div className="index-name">NASDAQ</div>
                    <div className="index-value">{marketData.nasdaq.value}</div>
                    <div className={`index-change ${marketData.nasdaq.isUp ? 'positive' : 'negative'}`}>
                      {marketData.nasdaq.isUp ? '+' : ''}{marketData.nasdaq.change}%
                    </div>
                  </div>
                </div>
                
                <div className="market-summary">
                  <div className="market-summary-heading">Daily Insight</div>
                  <div className="market-summary-content">
                    Markets are trending higher today on positive economic data and earnings announcements from major tech companies.
                  </div>
                </div>
                
                <div className="market-mood-meter" title={tooltips.sentiment}>
                  <div className="mood-label">Market Sentiment:</div>
                  <div className="mood-scale">
                    <div 
                      className={`mood-point ${marketSentiment === 'bearish' ? 'active-fear' : ''}`}
                      title={tooltips.fear}
                    ></div>
                    <div 
                      className={`mood-point ${marketSentiment === 'bearish' ? 'active-fear' : ''}`}
                      title={tooltips.fear}
                    ></div>
                    <div 
                      className={`mood-point ${marketSentiment === 'neutral' ? 'active-neutral' : ''}`}
                      title={tooltips.neutral}
                    ></div>
                    <div 
                      className={`mood-point ${marketSentiment === 'bullish' ? 'active-greed' : ''}`}
                      title={tooltips.greed}
                    ></div>
                    <div 
                      className={`mood-point ${marketSentiment === 'bullish' ? 'active-greed' : ''}`}
                      title={tooltips.greed}
                    ></div>
                  </div>
                  <div className={`mood-value ${marketSentiment === 'bullish' ? 'greed' : marketSentiment === 'bearish' ? 'fear' : 'neutral'}`}>
                    {marketSentiment === 'bullish' ? 'Greed' : marketSentiment === 'bearish' ? 'Fear' : 'Neutral'}
                  </div>
                </div>
              </div>
            )}

            {/* GeneralMarket Component (alternative view) */}
            {showGeneralMarket && <GeneralMarket symbol={symbol} />}

            {/* Big Movers Section */}
            <div className={symbol.length <= 0 ? 'big-movers show' : 'big-movers hide'}>
              <span className="fin-emph">Big Movers</span>
              <div className="movers">
                {bigMovers.map(mover => (
                  <div className="mover" key={mover}>
                    <ReactStocks doPoll tickers={[mover]} />
                    <button 
                      onClick={() => {
                        setSymbol(mover);
                      }}
                      title={`Run a comprehensive health check on ${mover} stock`}
                    >
                      Launch Health Check
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Checker Section */}
            <div>
              <div className={symbol.length <= 0 ? 'health-checker show' : 'health-checker hide'}>
                <span className="fin-emph">Health Check</span>
                <div className="search">
                  <select 
                    onChange={e => setSymbolXtraStep(e.target.value)}
                    title="Select a stock symbol to analyze"
                    value={symbolXtraStep}
                  >
                    {options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <button 
                    onClick={() => setSymbol(symbolXtraStep)}
                    title="Analyze the selected stock's financial health and performance metrics"
                    disabled={!symbolXtraStep}
                  >
                    Launch Check
                  </button>
                </div>
              </div>
              <Details symbol={symbol} sendData={handleSetSymbol} />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Main;