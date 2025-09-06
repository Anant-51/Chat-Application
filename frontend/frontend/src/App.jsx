import React from "react"
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import ChatLayout from "./components/chatlayout"
import ChatP{age} from "./pages/chatpage"
import ChatList from "./pages/chatList"
function App() {
  

  return (
   <Router>
    <Routes>
    <Route element={<ChatLayout/>}>
      <Route path="/chatpage" element={<ChatPage/>}/>
      <Route path="/logout" element={<Login/>}/>
      <Route path="/chatList" element={<chatlist/>}/>
    </Route>

    
    </Routes>
   </Router>
  )
}

export default App
