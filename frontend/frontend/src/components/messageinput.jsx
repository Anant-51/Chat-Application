import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { socket } from '../socket.js';
import { debounce, set } from 'lodash';
import { useCentralStore } from '../centralStore.jsx';
const typingStatus=useRef(null);
const activeChatId=useCentralStore((state)=>state.activeChatId);
const userId=useCentralStore((state)=>state.user.id);



export default function MessageInput({messages, setMessages,chatId}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  function onSubmit(data) {
    const formData = new FormData();
    formData.append("text", data.text);
    if (data.File && data.File.length > 0) {
      formData.append("file", data.File[0]);
    }
    
    const res= fetch('/api/messages/${chatId}', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      reset(); 
      setMessages(prevMessages => [...prevMessages, data.message]);
      const senderId=userId;
      
      socket.emit("send message",{
        senderId,
        message:data,
        chatId:activeChatId,


      });

    })
    .catch((error) => {
      console.error('Error:', error);
    });

  }
  const emitTyping=useCallback(debounce(() => {
  
    socket.emit("typing",{userId,activeChatId});
  }, 200),[]);
   const emitStopTyping=useCallback(debounce(() => {
  
    socket.emit("typing",{userId,activeChatId});
  }, 1000),[]);
  const handleChange = (e) => {
    emitTyping();
    emitStopTyping();
  };


  return(
<form onSubmit={handleSubmit(onSubmit)}>
   
    <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
        <input {...register("File")}type="file" class="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                <path fill="currentColor" d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z"/>
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 1H2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"/>
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z"/>
            </svg>
            <span class="sr-only">Upload image</span>
        </input>
        <button type="button" class="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.408 7.5h.01m-6.876 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM4.6 11a5.5 5.5 0 0 0 10.81 0H4.6Z"/>
            </svg>
            <span class="sr-only">Add emoji</span>
        </button>
        <textarea onChange={handleChange} id="chat" rows="1" class="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" {...register("text",{
            required:true,
        })} placeholder="Your message..."></textarea>
            <button type="submit" class="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
            <svg class="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
            </svg>
            <span class="sr-only">Send message</span>
        </button>
    </div>
</form>
  );
}
