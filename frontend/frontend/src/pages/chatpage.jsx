import React, { use, useLayoutEffect, useRef } from 'react'
import { useState,useCallback,useEffect,useRef} from 'react'
import {List} from react-window
import socket from '../socket.js'
import useCentralStore from '../centralStore.jsx'
const messages=useCentralStore((state)=>state.messages);
const user=useCentralStore((state)=>state.user);
const activeChatId=useCentralStore((state)=>state.activeChatId);
const appendMessage=useCentralStore((state)=>state.addMessage);
const prependMessage=useCentralStore((state)=>state.prependMessage);
const setInitialMessages=useCentralStore((state)=>state.setInitialMessages);


const updateMessageTick=useCentralStore((state)=>state.updateMessageTick);






const chatpage = () => {
  /* const [messages, setMessages] = useState([]); */
  const[initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const[cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const[scrollOffset, setScrollOffset] = useState(0);
  const[online, setOnline] = useState(false);
/*   const[seenStatus,setSeenStatus]=useState(false); */
  const correctionRef=useRef(null);
  const listref=useRef(null);
  const outerRef = useRef(null);
  const sizeRef = useRef({});
  const scrollAdjustHeight=useRef(0);
  const userId=user.id;
/*   useEffect(() => {
    socket.emit("setup", { _id: userId }); 
    socket.on("connected", (userData) => {
      if (userData._id==userId) {
        console.log("Socket connected for user:", userData._id);
      }
          
    });
   
   
;

   
   

    return () => {
      socket.off("connected");
      
    };
  }, [userId]);
  useEffect(()=>{
    const set= messages.chat.usersread;
    set.add(userId)
      
    
     socket.emit('message read',{
      chatId,
      set
     });

  

    socket.on("message read by all",()=>{
      setSeenStatus(true);

    })

  },[messages]) */
  useEffect(() => {
     
    socket.on("user online", (userData) => {
      if(messages.chat.isGroupchat==false && messages.chat.users.some(user => user._id === userData._id && userData._id !== userId)) {
        setOnline(true);
      }
    });
    socket.on("new message", (newMessage) => {
      if (newMessage.activeChatId === activeChatId) {
        appendMessage(newMessage);
      }
    });
      
    return () => {
      socket.off("new message");
      
      socket.off("user online");
    };  
  }, [activeChatId, userId]);
 

  const groupMessages=(messages) => {
    const group=[];
    const currentGroup=[];
    const lastSender=null;
    messages.forEach(msg=>{

      if(msg.sender._id!==lastSender){
        if(currentGroup.length>0){
          group.push(currentGroup);
        }
        currentGroup=[msg];
        lastSender=msg.sender._id;
      }
      else{
        currentGroup.push(msg);
      }
    });
    if(currentGroup.length>0){
      group.push(currentGroup);
      
    }
    return group;


    }
    const groups=React.useMemo(() => groupMessages(messages), [messages]);
  const fetchmessages=useCallback(async (cursor=null)=>{
    try{
      setLoading(true);
      const response=await fetch(`/api/chat/messages?cursor=${cursor}`);
     
      const data=await response.json();
   
      return data;
    }
    catch(err){
      console.error("Error fetching messages:", err);
      return err;
    }
    finally{
      setLoading(false);
    }
  },[]);


  const initialFetch=useEffect(async ()=>{
    try{
    if(initialLoading&&listref.current){
      const data=await fetchmessages();
      if(data && data.length > 0){
        setInitialMessages([...data.messages]);
        setCursor(data.nextCursor);
        setInitialLoading(false);
        setHasMore(data.hasMore);
        listref.current.scrollTo(messages.length - 1);
      }
    }
  }catch(err){
    console.error("Error during initial fetch:", err);
  }
}, [initialLoading, fetchmessages]);

const setSize = useCallback((i, size) => {
  if(!sizeRef.current[i] || sizeRef.current[i] !== size) {
    sizeRef.current[i] = size;
    if (listref.current) {
      listref.current.resetAfterIndex(0);
    }
  }
}, [listref]);

const loadoldermessages=useCallback(async ()=>{
  try{
    if(!loading && hasMore&& cursor&& listref.current){
      const data=await fetchmessages(cursor);
      const olderMessages = data.messages;

    
      if(data && data.messages.length > 0){
         const prependScrollHeight=olderMessages.reduce((sum,msg) => sum + sizeRef.current[msg.id]||60, 0);
         correctionRef.current=prependScrollHeight;
      /*   setMessages((prevMessages)=>[...data.messages, ...prevMessages]); */
        prependMessage(olderMessages);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
   
        useLayoutEffect(() => {
        
          if(listref.current){
              listref.current.scrollTo(listref.current.scrollOffset+correctionRef.current);
              correctionRef.current=0;
          }
      },[messages])
    }
    }
  }catch(err){
    console.error("Error loading older messages:", err);
  }
}, []);



const onScroll=({scrollOffset})=>{
  setScrollOffset(scrollOffset);
  if(outerRef.current){
    const scrollTop = outerRef.current.scrollTop;
    if(scrollTop <50 && hasMore && !loading && cursor){
      loadoldermessages();
    }
  }
}
const getSize=(index) => {
  return sizeRef.current[index] || 60;
 } // Default height if not set



const messageRow=({ index, style,data}) => {
 const{groups,setSize}=data;
  const group=groups[index];
  const rowRef = useRef(null);
  useLayoutEffect(() => {
    if (rowRef.current) {
      const el=rowRef.current;
      const rectheight = el.getBoundingClientRect().height;
      const style=window.getComputedStyle(el);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      const height = rectheight + marginTop + marginBottom;
      setSize(index, height);
    }
  }, [index,group, setSize]);
  return(
    <div ref={rowRef} style={{...style,marginBottom:"10px"}}>
      {group.map((msg)=>(
        <div key={msg._id} style={{padding:"2px 5px"}}>
          <b>{msg.sender}</b>:<b>{msg.content}</b>
        </div>
      ))}
    </div>
  )
};
     



  return (
    <List ref={listref}
    outerRef={outerRef}
    height={height}
    width={width}
    itemCount={messages.length}
    itemData={{groups, setSize}}
    itemSize={getSize}
    onScroll={onScroll}
    style={{overflowY:"auto",padding:"10px"}}>
    {messageRow}



    </List>
  )
}

export default chatpage;