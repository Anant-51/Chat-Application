import React from "react"
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import chatpage from "./pages/chatpage"
function App() {
  

  return (
   <Router>
    <Routes>
      <Route path="/chatpage/:chatId" element={<chatpage/>}/>

    
    </Routes>
   </Router>
  )
}

export default App
