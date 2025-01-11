const express = require('express');
const app = express();

app.use((req,res)=>{
    res.send("From Server");
})

app.get('/',(req,res)=>{
    res.send("Hey Yo");
})

app.get('/kush',(req,res)=>{
    res.send("Kush Page Motherfucker");
})

app.listen(4000,()=>{
    console.log("Server is Started,");
})