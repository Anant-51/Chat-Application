import { create } from "zustand";
import socket from "./socket";
 const useCentralStore=create((set,get)=>({
    messages: {},
    unreadMessages: {},
    activeChatId: null,
    user:null,
    isAuthenticated:false,
    socket:null,
    seenStatus:"sent",
    typingInformation:{},
    unrecievedMessagesWhileOffline:[],
    appendMessage:(msg)=>{
      const {messages,user,activeChatId}=get();
      const chatId=msg.chat._id;
      const msgByChatId=messages[chatId] || [];
    
     if(activeChatId===chatId){
        /* set((state)=>({unreadMessages:{...state.unreadMessages,[chatId]:0}})); */
         set((state)=>({messages:{...state.messages,[chatId]:[...msgByChatId,msg]}}));
        socket.emit("read",{msgId:msg._id,userId:user.id,chatId});
     }
     else{
       /*  set((state)=>({unreadMessages:{...state.unreadMessages,[chatId]:unreadMessages[chatId]?unreadMessages[chatId]+1:1}})); */
        socket.emit("delievered",{msgid:msg._id,userId:user.id,chatId});
     }
    },
    setUnreadCounts:(c,chatId)=>{
     
      set((state)=>({unreadMessages:{...state.unreadMessage,[chatId]:c}}));

   
    },
    prependMessage:(msg)=>{
        const {messages}=get();
      const chatId=msg.chat._id;
      const msgByChatId=messages[chatId] || [];
     set((state)=>({messages:{...state.messages,[chatId]:[...msg,...msgByChatId]}}));
    },
    setInitialMessages:(msg)=>{
        
      const chatId=msg.chat._id;
     
     set((state)=>({messages:{...state.messages,[chatId]:[...msg]}}));
      
    },
    updateBasedOnCurrentChat:(chatId)=>{
      const{user}=get();
      
    
      set((state)=>({
        activeChatId:chatId
       
      }));
     
      const msgByChatId=fetch(`/api/messages/${chatId}`).then(res=>res.json());
      msgByChatId.forEach((msg)=>{
       if(!msg.readBy?.includes(user.id)){
         socket.emit("read",{msgid:msg._id,userId:user.id,chatId});
       }
      })
     
    },
    setUser:(u)=>{
      
      set((state)=>({
        user:u
        ,isAuthenticated:true
      }));
      

   
    },
    logout:()=>{
     
      set((state)=>({
        user:null
        ,isAuthenticated:false
      }));
    },
     
    login:(formdata)=>{
      const{user}=get();
   
      const res=fetch("/api/auth/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(formdata)
      })
      .then(res=>res.json())
      .catch(err=>console.log(err));
      if(res.status===200){
      set((state)=>({
        user:res
        ,isAuthenticated:true
      }));
      socket.emit("fetch older messages",{userId:user.id});
   }
   else{
      set((state)=>({
        user:null
        ,isAuthenticated:false
      }));
   }
      

    },
    

    
    updateMessageTick:(msgId,chatId,seenStatus)=>{
      const{messages}=get();
      const msgByChatId=messages[chatId] || [];
      const updatedMessage=msgByChatId.map((msg)=>{
           msg.seenStatus=seenStatus;
           return msg;
        
      })
      set((state)=>({messages:{...state.messages,[chatId]:updatedMessage}}));
    },
    setTypingInformationAdd:(obj)=>{
      const {typingInformation}=get();
      const typingInformationByChatId=typingInformation[obj.chatId] || [];
      if(!typingInformation[obj.chatId]){
        typingInformation[obj.chatId]=[];
      }
      if(typingInformationByChatId.includes(obj.userId)){
      typingInformationByChatId=typingInformation[obj.chatId].push(obj.userId);
      }
   
      set((state)=>({typingInformation:{...state.typingInformation,[obj.chatId]:typingInformationByChatId}}));
    },

   setTypingInformationDelete:(obj)=>{
      const {typingInformation}=get();
      const typingInformationByChatId=typingInformation[obj.chatId] || {};
      if(!typingInformation[obj.chatId]){
        typingInformation[obj.chatId]=[];
      }
      typingInformationByChatId=typingInformation[obj.chatId].filter((id)=>id!==obj.userId);
   
      set((state)=>({typingInformation:{...state.typingInformation,[obj.chatId]:typingInformationByChatId}}));
    },
    handleUnreadMessagesWhileOffline:(messages)=>{
      const {unrecievedMessagesWhileOffline}=get();
      const{user}=get();
      set((state)=>({unrecievedMessagesWhileOffline:[...unrecievedMessagesWhileOffline,msg]}));
      unrecievedMessagesWhileOffline.forEach(msg=>{
        const chatId=msg.chat._id;
        const msgId=msg._id;
        if(!msg.readBy?.includes(user.id)){
          socket.emit("delievered",{msgId,userId:user.id,chatId});
        }
       })
    }

     

   

 }))  
 export default useCentralStore;