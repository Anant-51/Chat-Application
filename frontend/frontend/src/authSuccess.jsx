import socket from "./socket";

function authSuccess(data){

   socket.emit("setup",{id:data.id});


}

export default authSuccess;
