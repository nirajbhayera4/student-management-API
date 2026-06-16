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

app.get("/students",(req,res)=>{
    const {city}=req.query;

    if(city){
        const filtered =students.filter(s=>s.city===city);

        return res.json(filtered);

    }
    res.json(students);
});


app.get("/students/:id",(req,res)=>{
    const id=parseInt(req.params.id);
    const student=students.find( s=> s.id===id);


    if(!student){
        return res.status(404).json({
            message :"student not found"
        });
    }
    res.json(student);
});

//POST 

app.post("/students",(req,res)=>{
    const newStudent={
        id: students.length+1,
        name : req.body.name,
        city : req.body.city
    };

    students.push(newStudent);
    res.status(201).json(newStudent);
});



//PUT (update full data);

app.put("/students/:id",(req,res)=>{
    const id=parseInt(req.params.id);
    const index=students.findIndex(s=>s.id===id);

    if(index==-1){
        return res.status(404).json({
            message :"student not found"
        });

    }
    students[index]={
        id :id,
        name :req.body.name,
        city : req.body.city
    };

    res.json(students[index]);
});


//delete 
app.delete("/students/:id",(req,res)=>{
    const id=parseInt(req.params.id);

    students=students.filter(s=>s.id !==id);

    res.json({
        message : "student deleted successfully"
    });
});

