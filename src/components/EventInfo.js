import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EventInfo(props){
    const [eventData, setEventData] = useState("");
    const [eventDataError, setEventDataError] = useState("");

    useEffect(()=>{
        getEventData();
    },[props.symbol])


    function getEventData(){
            axios.get(`https://amandanwadukwe.a2hosted.com/loud-mouth-finance?activeStock=${props.symbol}`)
              .then(res => {
                try{
                    console.log('Event',res.data.next_big_event)
                    setEventData(res.data.next_big_event);
                    props.sendData(res.data.next_big_event);

                } catch (err){
                    setEventDataError("We're sorry this information is not available at the moment")
                }
                

              })
              .catch(err => console.log(err))
    }

    return <div className="event">
        <h3>What Can I look forward to next?</h3>
        {eventData && eventData.event_name ? (
  <div><p>{eventData.event_name}<br />{new Date(eventData.event_date).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</p><div><span>Impact</span><div style={{width:20,height:20, borderRadius:`50vmax`, backgroundColor:`${eventData.predicted_impact.RAG_status}`}}></div>{eventData.predicted_impact.description}</div></div>):<div></div>}     
    </div>
}