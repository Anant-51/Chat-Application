import React from 'react'
import {useNavigate,useParams} from "react-router-dom";


const chatcard = ({chatId,users,latestmessage}) => {
    const {chatId}=useParams();
    async function handleClick(){
        const navigate=useNavigate();
        navigate(`/chatpage/${chatId}`);
}
  return (

    <div onClick={handleClick}></div>
  )
}

export default chatcard