import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useCentralStore } from '../centralStore.jsx';
const setActiveChatId=useCentralStore((state)=>state.setActiveChatId);
const updateBasedOnCurrentChat=useCentralStore((state)=>state.updateBasedOnCurrentChat);
const navigate = useNavigate();






const chatcard = ({chatId,chatName,isGroupChat,chatImage}) => {
  const handleClick = () => {
  setActiveChatId(chatId);
  navigate('/chatpage');
  updateBasedOnCurrentChat(chatId);
};

  
  return (

<div onClick={handleClick}>
  <div class="chat-card">
  <div class="avatar">
    <img src="https://via.placeholder.com/50" alt="Profile" />
  </div>

  <div class="chat-info">
    <div class="chat-header">
      <span class="chat-name">John Doe</span>
      <span class="chat-time">12:45 PM</span>
    </div>
    <div class="chat-footer">
      <span class="chat-message">Hey, are you coming today?</span>
      <span class="chat-unread">2</span>
    </div>
  </div>
</div>
     </div>
  )
}

export default chatcard