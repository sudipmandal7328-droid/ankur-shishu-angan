const express=require("express"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const app=express();app.use(express.json());app.use(express.static(path.join(__dirname,"public")));
const DB=path.join(__dirname,"data.json");const sessions=new Set();
const read=()=>fs.existsSync(DB)?JSON.parse(fs.readFileSync(DB)):[];const write=x=>fs.writeFileSync(DB,JSON.stringify(x,null,2));
const questions=[{q:"2 + 3 = ?",options:["4","5","6","7"],answer:1},{q:"Which one is a fruit?",options:["Apple","Chair","Book","Pen"],answer:0},{q:"5 - 2 = ?",options:["1","2","3","4"],answer:2},{q:"সূর্য কোথা থেকে ওঠে?",options:["পশ্চিম","উত্তর","দক্ষিণ","পূর্ব"],answer:3},{q:"বাংলা বর্ণমালায় প্রথম অক্ষর কোনটি?",options:["অ","আ","ক","ই"],answer:0}];
function auth(req,res,next){let t=(req.headers.authorization||"").replace("Bearer ","");if(!sessions.has(t))return res.status(401).json({error:"Unauthorized"});next()}
app.post("/api/applications",(req,res)=>{let a=read(),id="ASA-"+Math.floor(10000+Math.random()*90000);let x={id,...req.body,date:new Date().toISOString(),status:"Pending",testScore:null};a.push(x);write(a);res.json({id})});
app.get("/api/applications/:id",(req,res)=>{let x=read().find(v=>v.id===req.params.id);x?res.json(x):res.status(404).json({error:"Application not found"})});
app.get("/api/test/questions",(req,res)=>res.json(questions.map(({q,options})=>({q,options}))));
app.post("/api/test/submit",(req,res)=>{let a=read(),x=a.find(v=>v.id===req.body.id);if(!x)return res.status(404).json({error:"Application not found"});let score=(req.body.answers||[]).reduce((s,v,i)=>s+(v===questions[i].answer?1:0),0);x.testScore=score+"/"+questions.length;x.testStatus=score>=3?"Qualified":"Not Qualified";write(a);res.json({score,total:questions.length,status:x.testStatus})});
app.post("/api/admin/login",(req,res)=>{let u=process.env.ADMIN_USER||"admin",p=process.env.ADMIN_PASS||"change-me";if(req.body.username!==u||req.body.password!==p)return res.status(401).json({error:"Invalid login"});let t=crypto.randomBytes(32).toString("hex");sessions.add(t);res.json({token:t})});
app.get("/api/admin/applications",auth,(req,res)=>res.json(read()));
app.patch("/api/admin/applications/:id",auth,(req,res)=>{let a=read(),x=a.find(v=>v.id===req.params.id);if(!x)return res.status(404).json({error:"Not found"});x.status=req.body.status;write(a);res.json(x)});
app.listen(process.env.PORT||3000,()=>console.log("Ankur Shishu Angan server running"));
