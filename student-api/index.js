const express=require ("express");
const app=express();

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("API is working");
});

app.listen(3000,()=>{
    console.log("server running on port 3000");
});

let students=[
    {
        id:1,
        name:"student1",
        age:18,
        email:"student1@example.com"
    },
    {
        id:2,
        name:"student2",
        age:19,
        email:"student2@example.com"
    },
    {
        id:3,
        name:"student3",
        age:20,
        email:"student3@example.com"
    },
    {
        id:4,
        name:"student4",
        age:21,
        email:"student4@example.com"
    }
];

app.get("/students",(res,res)=>{
    res.json(students);
});


app.get("students/:id",(req,res)=>{
    const id=parseInt(req.params.id);
    const student=students.find( s=> s.id===id);


    if(!student){
        return res.status(404).json({
            message :"student not found"
        });
    }
    res.json(student);
})