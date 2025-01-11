const express = require('express');
const app = express();

app.get('/',(req,res)=>{
    res.send("Hey Yo");
})

// app.get('/user',(req,res)=>{
//     res.send('User GET route');
// })
app.get('/user/:id',(req,res)=>{        // DYNAMIC ROUTING
    const userId = req.params.id;
    res.send(`/user/${userId} route`);
})
app.get('/user/:id/:name/:password',(req,res)=>{        // DYNAMIC ROUTING
    console.log(req.params);
    res.send(`Dynamic data `);
})
app.get('/user',(req,res)=>{
    const {name,id} = req.query;
    res.send(`${name} & ${id}`);
})
// app.get('/use?r',(req,res)=>{       // here the e is optional , means if u make a API call at /user or /usr still this route will work
//     res.send('using ? optional ');
// })
    app.get('/u(se)?r',(req,res)=>{       // here the (se) is grouped together and are optional , means if u make a API call at /user or /ur still this route will work
        res.send('using ()? optional ');
    })
// app.get('/use+r',(req,res)=>{   // here the route will work if u use /user or /useeer or /useeeeeeeeeer . the Route will still work 
//     res.send(`/use+r route`);
// })
app.get('/use*r',(req,res)=>{   // here the route will work if u put anything in the place of * like /useKushr or /use8494ewr . the Route will still work 
    res.send(`/use*r route`);
})
app.get(/.*user$/,(req,res)=>{   // this is REGEX , if your starting routing contain any thing but ends with user  
    res.send(`Regex Route`);
})
app.get(/user/,(req,res)=>{   // this is REGEX , if your route contain user  
    res.send(`Regex Route with no special character`);
})

app.post('/user',(req,res)=>{
    res.send({name: "Kush" , age : "20"});
})
app.patch('/user',(req,res)=>{
    res.send('Patch request from User Route');
})
app.delete('/user',(req,res)=>{
    res.send("Deleted User");
})

app.listen(4000,()=>{
    console.log("Server is Started,");
})