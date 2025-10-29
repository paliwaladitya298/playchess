const express = require("express")
const socket = require("socket.io")
const http = require("http")
const {Chess} = require("chess.js")
const path = require("path")
const { time, log } = require("console")

const app = express()

const server = http.createServer(app)
const io = socket(server);

const  chess =  new Chess();
let player = {}
let currentplayer = "W"

app.set("view engine" , "ejs")
app.use(express.static(path.join(__dirname , "public")));

app.get("/" , (req , res)=>{
    res.render("index" ,{title : "Chess Game"}) 
})

io.on("connection" , (uniquesocket)=>{
    console.log("connect");
    
if(!player.white){
    player.white = uniquesocket.id
    uniquesocket.emit("PlayerRole" , "w")
}
else if(!player.black){
    player.black = uniquesocket.id
    uniquesocket.emit("PlayerRole" , "b")
}
else{
    uniquesocket.emit("SpectatorRole")
}
uniquesocket.on("disconnect" ,function(){
    if(uniquesocket.id === player.white){
        delete player.white;
    }
    else(uniquesocket.id === player.black) 
    {
        delete player.black;
    }
})

uniquesocket.on("move" , (move)=>{
    try{
    if(chess.turn() === "w" && uniquesocket.id !== player.white) return
    if(chess.turn() === "b" && uniquesocket.id !== player.black) return

    const result = chess.move(move)
    if(result){
        currentplayer = chess.turn()
        io.emit("move" ,move)
        io.emit("StateBoard" , chess.fen())
    }
    else{
        console.log("Invalid Move :",move);
        uniquesocket.emit("invalidMove" , move)
    }
    }
    catch(err){
    console.log(err);
      uniquesocket.emit("invalidMove" , move)
    }
})



})

server.listen(3000)

