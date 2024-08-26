import { useState, useEffect } from 'react';
import Verdict from './Verdict.js';
import EventInfo from './EventInfo.js';
import axios from 'axios';
import defaultThumbnail from '../resources/thumbnail-default.jpg';

export default function Details(props) {
    // const [details, setDetails] = useState({});
    const [stockName, setStockName] = useState(props.symbol);
    const [source, setSource] = useState('');
    const [marketState, setMarketState] = useState('');
    const [marketCapitalisation, setMarketCapitalisation] = useState('');
    const [forwardPERation, setForwardPERatio] = useState('');
    const [weekRange52, setWeekRange52] = useState('');
    const [earningsGrowthQuart, setEarningGrowthQuart] = useState('');
    const [news, setNews] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [chatInteractionCount, setChatInteractionCount] = useState(0);
    const [fullStockData, setFullStockData] = useState({});
    // const [message, setMessage] = useState([]);
    const [verdictData, setVerdictData] = useState("");
    const [currentChatID, setCurrentChatID] = useState("");
    const [eventData, setEventData] = useState("");
    const handleVerdictData = (data) => { setVerdictData(data) };
    const handleEventData = (data) => { setEventData(data) };
    const [allChats, setAllChats] = useState([{ content: `Hello, ask me something about ${stockName}`, role: "system" }])

    useEffect(() => {
        axios.get(`https://amandanwadukwe.a2hosted.com/loud-mouth-finance/stock-details?activeStock=${props.symbol}`)
            .then(res => {
                setStockName(res.data.quote.shortName);
                setSource(res.data.quote.quoteSourceName);
                setMarketState(res.data.quote.marketState);
                setMarketCapitalisation(res.data.quote.marketCap);
                setForwardPERatio(res.data.quote.forwardPE);
                setWeekRange52(res.data.quote.fiftyTwoWeekHigh - res.data.quote.fiftyTwoWeekLow);
                setEarningGrowthQuart(res.data.quote.earningsQuarterlyGrowth);
                setNews(res.data.news.news)
                setFullStockData(res.data);
            })
            .catch(err => console.log("err", err))
    }, [props.symbol])

    function interactWithChatbot() {
        const message = newQuestion;


        if (chatInteractionCount == 0) {
            const chatInitiationArray = [{ role: "system", content: "You are a helpful Financial analyst." }, {
                role: "user", content: `Analyze the following tech stock data and provide a diagnostic check based on sentiment and volatility, with recommendations on when to buy and sell: ${JSON.stringify(fullStockData)}. give concise and specific response in JSON only format. Use the schema:
      {"sentiment_score": "","volatility_score": "","recommendations": {"buy": "", "sell": ""}}`}, { "role": "system", "content": JSON.stringify(verdictData) }, {
                role: "user", content: `Based on the sentiment around ${stockName} today(${new Date()}) and the next significant earning date what is the next big event to look forward to? Please provide a really concise and specific json only response with no preamble including the predicted event impact using RAG status(if unknown leave RAG status as grey) and with each field not more than a sentence. Use the JSON Schema'*': {
"next_big_event": {
    "event_name": "",
    "event_date": "",
    "predicted_impact": {
      "RAG_status": "",
      "description": ""        
      }
    }
}`}, { "role": "system", "content": JSON.stringify(eventData) }, { "role": "user", "content": `taking all the previous data into account, ${message}. Provide a brief, conversational response` }]

            axios.post("https://amandanwadukwe.a2hosted.com/loud-mouth-finance/initiate-chat", { chatHistory: chatInitiationArray })
                .then(res => {
                    setAllChats(prevArray => [...prevArray, { content: res.data.chatResponse, role: "system" }]);
                    setCurrentChatID(res.data.id)
                })
                .catch(err => console.log("Chat initiation error ---------->", err))
        } else {
            const chatUpdate = {
                id: currentChatID,
                message: { "role": "user", "content": message}
            }

            axios.put("https://amandanwadukwe.a2hosted.com/loud-mouth-finance/continue-chat", chatUpdate)
                .then(res => { setAllChats(prevArray => [...prevArray, { content: res.data.chatResponse, role: "system" }]); })
                .catch(err => console.log("General chat error ---------->", err))
        }


        setChatInteractionCount(chatInteractionCount + 1)
        //add logic if it's not the first message
    }

    return <div className={props.symbol.length > 0 ? 'details-container show' : 'details-container hide'}>
        <div className="details">
            <span className="tooltip" title="">{stockName}</span><br></br>
            <span className="tooltip" title=""><span>Source</span> {source}</span><br></br>
            <span className="tooltip" title=""><span>Market State</span> {marketState}</span><br></br>
            <span className="tooltip" title="This reflects the total market value of the company's outstanding shares. A high market cap generally indicates a well-established, stable company. Investors might view high market cap companies as safer investments, though they may offer lower growth potential compared to smaller companies."><span>Market Cap</span> {marketCapitalisation}</span><br></br>
            <span className="tooltip" title="This shows how much investors are willing to pay for a dollar of expected future earnings. A high P/E ratio may suggest that the stock is overvalued or that investors expect significant future growth. A lower P/E could indicate a potentially undervalued stock or lower expected growth."><span>Forward P/E Ratio</span> {forwardPERation}</span><br></br>
            <span className="tooltip" title="This indicates the stock's price volatility over the past year. A wide range suggests significant price movement, which might appeal to traders looking for volatility or deter conservative investors seeking stability."><span>52-Week Range</span> {weekRange52}</span><br></br>
            <span className="tooltip" title="This measures the company's growth in earnings compared to the same quarter in the previous year. Strong earnings growth can be a positive signal, suggesting the company is expanding and increasing profitability, which might attract growth-oriented investors. Conversely, low or negative growth could be a red flag."><span>Earnings Growth (Quarterly)</span> {earningsGrowthQuart}</span><br></br>
        </div>
        <Verdict symbol={props.symbol} sendData={handleVerdictData} />
        <EventInfo symbol={props.symbol} sendData={handleEventData} />
        <div className="chatbot-container">
            <div className="chat">
                {console.log("allChat ", allChats)}
                {allChats.map(chat => {
                    return <div className={chat.role}>{chat.content}</div>
                })}

            </div>
            <input type="text" onChange={(e => {
                setNewQuestion(e.target.value);
            })} placeholder="Ask me something!" />
            <button type="button" onClick={() => { setAllChats(prevArray => [...prevArray, { content: newQuestion, role: "user" }]);setNewQuestion(""); interactWithChatbot();  }}>Send</button>
        </div>
        <div className="related-articles">

            {/* <button type="button" onClick={()=>console.log({"eventData":eventData,"verdictData":verdictData})}>Show all data I can provide chatbot</button> */}
            <h2>Related Articles</h2>
            {news.map(newsObject => {
                // console.log("newObject", newsObject)
                return <div><img class="thumbnail" src={newsObject.thumbnail == undefined ? defaultThumbnail : newsObject.thumbnail.resolutions[0]['url']}></img> <div><a href={newsObject.link}>Title: {newsObject.title}</a></div></div>
            })}

            {/* {console.log("news with thumbnail", news.filter(object => object.thumbnail != undefined))} */}
        </div>
    </div>


}