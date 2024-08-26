import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Verdict(props){
    const [verdictData, setVerdictData] = useState("");
    const [verdictDataError, setVerdictDataError] = useState("");

    useEffect(()=>{
        getVerdictData();
    },[props.symbol])


        const isDataJSON = (data) => { try { JSON.parse(data); return true; } catch (e) { return false; } };

 


    function getVerdictData(){
            axios.get(`https://amandanwadukwe.a2hosted.com/loud-mouth-finance/stock-market-now?activeStock=${props.symbol}`)
              .then(res => {
                // try {
                    
                    // if (isDataJSON) {
                        setVerdictData(res.data);
                        props.sendData(res.data);
                    // } else {
                    //     throw new Error("Data is not JSON");
                    // }
                // } catch (err) {
                //     setVerdictDataError("We're sorry this information is not available at the moment");
                // }
                


              })
              .catch(err => console.log(err))
    }

    return <div className="verdict">
        {/* <h3>What does this mean?</h3>
        {console.log('Verdict', verdictDataError)}
        {verdictDataError == "We're sorry this information is not available at the moment" ?<p>{verdictDataError}</p> :(<div><p>Volatility score<br></br>{verdictData.volatility_score}</p><p>Sentiment score<br></br>{verdictData.sentiment_score}</p><h3>Recommendations</h3><span><b>Buy:</b> {verdictData.recommendations.buy}</span><br></br><span><b>Sell:</b> {verdictData.recommendations.sell}</span></div>)} */}
        
{console.log('Verdict', verdictDataError)}
{verdictDataError === "We're sorry this information is not available at the moment" ? (
  <p>{verdictDataError}</p>
) : (
  verdictData && verdictData.volatility_score !== undefined && verdictData.recommendations ? (
    <div>
      <p><span>Volatility score</span><br />{verdictData.volatility_score}</p>
      <p><span>Sentiment score</span><br />{verdictData.sentiment_score}</p>
      <h3>What does this mean?</h3>
      <span><span>Buy</span><br /> {verdictData.recommendations.buy}</span><br />
      <span><span>Sell</span><br /> {verdictData.recommendations.sell}</span>
    </div>
  ) : (
    <p>Loading data or no recommendations available.</p>
  )
)}
{/* <button onClick={() => }>Send Data</button>; */}
    </div>
}