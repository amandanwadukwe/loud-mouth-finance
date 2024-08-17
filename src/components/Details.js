import { useState, useEffect } from 'react';
import Verdict from './Verdict.js';
import EventInfo from './EventInfo.js';
import axios from 'axios';

export default function Details(props){
    // const [details, setDetails] = useState({});
    const [stockName, setStockName] = useState('');
    const [source, setSource] = useState('');
    const [marketState, setMarketState] = useState('');
    const [marketCapitalisation, setMarketCapitalisation]= useState('');
    const [forwardPERation, setForwardPERatio] = useState('');
    const [weekRange52, setWeekRange52] = useState('');
    const [earningsGrowthQuart, setEarningGrowthQuart] = useState('');
    const [news,setNews] = useState([]);

    useEffect(()=>{
        axios.get(`https://amandanwadukwe.a2hosted.com/loud-mouth-finance/stock-details?activeStock=${props.symbol}`)
        .then(res => {console.log(res.data);
            setStockName(res.data.quote.shortName);
            setSource(res.data.quote.quoteSourceName);
            setMarketState(res.data.quote.marketState);
            setMarketCapitalisation(res.data.quote.marketCap);
            setForwardPERatio(res.data.quote.forwardPE);
            setWeekRange52(res.data.quote.fiftyTwoWeekHigh - res.data.quote.fiftyTwoWeekLow);
            setEarningGrowthQuart(res.data.quote.earningsQuarterlyGrowth);
            setNews(res.data.news.news)
            console.log("stockName", stockName)
        })
        .catch(err => console.log("err", err))
        },[props.symbol])

    return <div className={props.symbol.length > 0 ? 'details-container show':'details-container hide'}>       
        <div className="details">
            <span className="tooltip" title="">{stockName}</span><br></br>
            <span className="tooltip" title=""><span>Source</span> {source}</span><br></br>
            <span className="tooltip" title=""><span>Market State</span> {marketState}</span><br></br>
            <span className="tooltip" title="This reflects the total market value of the company's outstanding shares. A high market cap generally indicates a well-established, stable company. Investors might view high market cap companies as safer investments, though they may offer lower growth potential compared to smaller companies."><span>Market Cap</span> {marketCapitalisation}</span><br></br>
            <span className="tooltip" title="This shows how much investors are willing to pay for a dollar of expected future earnings. A high P/E ratio may suggest that the stock is overvalued or that investors expect significant future growth. A lower P/E could indicate a potentially undervalued stock or lower expected growth."><span>Forward P/E Ratio</span> {forwardPERation}</span><br></br>
            <span className="tooltip" title="This indicates the stock's price volatility over the past year. A wide range suggests significant price movement, which might appeal to traders looking for volatility or deter conservative investors seeking stability."><span>52-Week Range</span> {weekRange52}</span><br></br>
            <span className="tooltip" title="This measures the company's growth in earnings compared to the same quarter in the previous year. Strong earnings growth can be a positive signal, suggesting the company is expanding and increasing profitability, which might attract growth-oriented investors. Conversely, low or negative growth could be a red flag."><span>Earnings Growth (Quarterly)</span> {earningsGrowthQuart}</span><br></br>
        </div>
        <Verdict symbol={props.symbol} />
        <EventInfo symbol={props.symbol} />
        <div className="related-articles">
        <h2>Related Articles</h2>
            {news.filter(object => object.thumbnail != undefined).map(newsObject => {
            
                return <div><img class="thumbnail" src={ newsObject.thumbnail == undefined ? newsObject.thumbnail.resolutions[0]['url']: ''}></img> <div><a href={newsObject.link}>Title: {newsObject.title}</a></div></div>
            })}
        </div>
    </div>
        
        
}