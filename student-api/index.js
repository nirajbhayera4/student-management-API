const express=require ("express");
const app=express();

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("API is working");
});

app.listen(3000,()=>{
    console.log("server running on port 3000");
});

