import { useState, useEffect } from 'react';
import axios from 'axios';

export default function GeneralMarket() {
  const [VIXData, SetVIXData] = useState({});
  const [verdict, setVerdict] = useState({}); // Corrected destructuring
  const [verdictError, setVerdictError] = useState('');

  useEffect(() => {
    getVIXData();
    getVerdictData();
  }, []); // Dependency array is empty to run only on mount

  function getVIXData() {
    axios.get(`https://amandanwadukwe.a2hosted.com/loud-mouth-finance/general-market-details`)
      .then(res => {
        // console.log(res.data[0]);
        SetVIXData(res.data[0]); // Assuming you want to set the VIX data
      })
      .catch(err => {
        console.log(err)
      });
  }

  function getVerdictData() {
    axios.get(`http://localhost:5000/market-now`)
      .then(res => {
        try{
            console.log(JSON.parse(res.data));
            verdict(JSON.parse(res.data));
        } catch(err) {
            setVerdictError('This information is not available at the moment')
        }
        // Assuming you want to set the VIX data
      })
      .catch(err => {
        console.log(err);
      });
  }

  return <div className="general-market">
    <h3>Market Right Now</h3>
    <span>{VIXData.shortName}</span>
    <p className="tooltip" title="shows the volatility index's lowest and highest values over the past year. Meaning: A higher range suggests greater market volatility, which can indicate higher risk or uncertainty in the market. When the VIX is near the upper end of this range, it might suggest increased market fear, which could lead to more conservative investment strategies. Conversely, a lower VIX indicates calmer markets, which might encourage more aggressive investment approaches.">52 Week Range<br></br><span>Low:{VIXData.fiftyTwoWeekLow}</span><span>High: {VIXData.fiftyTwoWeekHigh}</span></p>
    <p className="tooltip" title="The regular market change percent reflects the percentage change in the VIX's value during the last trading session. Meaning: A significant increase in this percentage can signal rising market anxiety, potentially prompting investors to hedge their portfolios or reduce exposure to riskier assets. A decrease, on the other hand, may suggest improving market confidence, possibly leading to more risk-taking.">Regular Market Change Percent<br></br>{VIXData.regularMarketChangePercent}</p>
    <p className="tooltip" title="The 200-day average (22.3272) represents the average value of the VIX over the past 200 days. Meaning: A higher 200-day average indicates a long-term trend of elevated market volatility, which could suggest ongoing market instability. A lower average might reflect sustained market calm, potentially signaling a favorable environment for equity investments. Investors often use this as a benchmark to assess whether current volatility is above or below the long-term norm.">Two-hundred day average<br></br>{VIXData.twoHundredDayAverage}</p>

  <h3>What does this mean?</h3>
  <div>{verdictError.length > 5 ? verdictError : <div></div>}</div>
  </div>;
}
