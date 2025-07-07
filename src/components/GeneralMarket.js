import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/GeneralMarket.css';

export default function GeneralMarket(props) {
  const [VIXData, setVIXData] = useState({});
  const [verdict, setVerdict] = useState({});
  const [verdictError, setVerdictError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVIXData();
    getVerdictData();
  }, []); // Dependency array is empty to run only on mount

  function getVIXData() {
    axios.get(`https://amandanwadukwe.a2hosted.com/loud-mouth-finance/general-market-details`)
      .then(res => {
        setVIXData(res.data[0]);
        setLoading(false);
      })
      .catch(err => {
        console.log("Error fetching VIX data:", err);
        setLoading(false);
      });
  }

  function getVerdictData() {
    axios.get(`https://amandanwadukwe.a2hosted.com/loud-mouth-finance/market-now`)
      .then(res => {
        try {
          const parsedData = JSON.parse(res.data);
          setVerdict(parsedData);
        } catch(err) {
          setVerdictError('This information is not available at the moment');
        }
      })
      .catch(err => {
        console.log("Error fetching market verdict:", err);
        setVerdictError('Unable to retrieve market analysis at this time');
      });
  }

  // Calculate the position of current VIX value within the 52-week range
  const calculateRangePosition = () => {
    if (!VIXData.regularMarketPrice || !VIXData.fiftyTwoWeekLow || !VIXData.fiftyTwoWeekHigh) {
      return 50; // Default to middle if data isn't available
    }
    
    const position = ((VIXData.regularMarketPrice - VIXData.fiftyTwoWeekLow) / 
                    (VIXData.fiftyTwoWeekHigh - VIXData.fiftyTwoWeekLow)) * 100;
    return Math.max(0, Math.min(100, position)); // Ensure value is between 0-100
  };

  // Determine if VIX change is positive
  const isVixChangePositive = () => {
    return VIXData.regularMarketChangePercent > 0;
  };

  return (
    <div className={props.symbol.length <= 0 ? 'general-market show' : 'general-market hide'}>
      {loading ? (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Loading market data...</p>
        </div>
      ) : (
        <>
          <h3>Market Volatility Index (VIX)</h3>
          
          <div className="vix-indicator">
            <div className="vix-value">{VIXData.regularMarketPrice?.toFixed(2) || 'N/A'}</div>
            <div className={`vix-change ${isVixChangePositive() ? 'positive' : 'negative'}`}>
              {isVixChangePositive() ? '+' : ''}
              {VIXData.regularMarketChangePercent?.toFixed(2) || 0}%
            </div>
          </div>
          
          <div className="vix-description">
            <span>{VIXData.shortName || 'CBOE Volatility Index'}</span>
            <p>The VIX measures market expectation of near-term volatility conveyed by stock index option prices.</p>
          </div>
          
          <div className="vix-metrics">
            <div className="metric-card" 
                 title="Shows the volatility index's lowest and highest values over the past year. A higher range suggests greater market volatility.">
              <h4>52 Week Range</h4>
              <div className="range-display">
                <div className="range-fill" style={{ width: `${calculateRangePosition()}%` }}></div>
                <span 
                  className="range-marker" 
                  style={{ left: `${calculateRangePosition()}%` }}
                ></span>
              </div>
              <div className="range-labels">
                <span>Low: {VIXData.fiftyTwoWeekLow?.toFixed(2) || 'N/A'}</span>
                <span className="current-value">Current: {VIXData.regularMarketPrice?.toFixed(2) || 'N/A'}</span>
                <span>High: {VIXData.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
            
            <div className="metric-card"
                 title="The percentage change in the VIX's value during the last trading session. A significant increase can signal rising market anxiety.">
              <h4>Daily Change</h4>
              <div className={`change-value ${isVixChangePositive() ? 'positive' : 'negative'}`}>
                {isVixChangePositive() ? '+' : ''}
                {VIXData.regularMarketChangePercent?.toFixed(2) || 0}%
              </div>
              <p>From previous close: {VIXData.regularMarketPreviousClose?.toFixed(2) || 'N/A'}</p>
            </div>
            
            <div className="metric-card"
                 title="The average value of the VIX over the past 200 days. A higher average indicates a long-term trend of elevated market volatility.">
              <h4>200-day Average</h4>
              <div className="average-value">
                {VIXData.twoHundredDayAverage?.toFixed(2) || 'N/A'}
              </div>
              <p className={VIXData.regularMarketPrice > VIXData.twoHundredDayAverage ? 'above-average' : 'below-average'}>
                {VIXData.regularMarketPrice > VIXData.twoHundredDayAverage ? 'Above' : 'Below'} long-term average
              </p>
            </div>
          </div>

          <h3>Market Outlook</h3>
          <div className="market-outlook">
            {verdictError ? (
              <div className="verdict-error">{verdictError}</div>
            ) : (
              <div className="verdict-content">
                <p>
                  {verdict.summary || 
                   `Current VIX at ${VIXData.regularMarketPrice?.toFixed(2) || 'N/A'} indicates 
                   ${isVixChangePositive() ? 'increasing' : 'decreasing'} market volatility. 
                   ${VIXData.regularMarketPrice > 20 ? 
                     'Higher VIX levels suggest increased market uncertainty.' : 
                     'Lower VIX levels suggest relative market calm.'}`
                  }
                </p>
                <div className="investor-advice">
                  <h4>Investor Considerations</h4>
                  <ul>
                    {verdict.advice ? (
                      verdict.advice.map((item, index) => <li key={index}>{item}</li>)
                    ) : (
                      <>
                        <li>Monitor market movements closely in the current volatility climate</li>
                        <li>{VIXData.regularMarketPrice > 25 ? 
                          'Consider more defensive positions while volatility is elevated' : 
                          'Current volatility levels are favorable for normal investment activities'}</li>
                        <li>Remember that VIX is just one indicator and should be considered alongside other market metrics</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}