require("dotenv").config();
const express = require ('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const AppointmentService = require('./services/AppointmentService');
const appointment = require('./models/Appointment');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.set('view engine','ejs');

mongoose.connect('mongodb://localhost:27017/agendamento');

const MONGODB_URI = 'mongodb+srv://'+process.env.MONGODB_USER+':'+process.env.MONGODB_PASSWORD+'@cluster0.pcrnxri.mongodb.net/'+process.env.MONGODB_DATABASE+'retryWrites=true&w=majority'


app.get('/',(req,res)=>{
    res.render('index')
});

app.get('/cadastro',(req,res)=>{
    res.render('create')
});

app.post('/create',async(req,res)=>{
    var status = await AppointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time 
    )
    if(status){
        res.redirect('/')
    }else{
        res.send('Ocorreu uma falha!');
    }
});

app.get('/getcalendar', async(req,res)=>{
    var appointments = await AppointmentService.GetAll(false);
    res.json(appointments);
});

app.get('/event/:id',async(req,res)=>{
    var appointment = await AppointmentService.GetById(req.params.id);
    console.log(appointment)
    res.render('event',{appo: appointment}); 
});

app.post('/finished',async(req,res)=>{
    var id = req.body.id;
    var result =  await AppointmentService.Finish(id);
    res.redirect('/')
});

app.get('/list',async(req,res)=>{
    var appos = await AppointmentService.GetAll(true);
    res.render('list',{appos})
});

app.get('/searchresult',async(req,res)=>{
    var appos = await AppointmentService.Search(req.query.search)
    if (appos!="") {
        res.render("list",{appos});
    }else{
     res.redirect("/list");  
   }
});

setInterval(async () => {

    await AppointmentService.SendNotification()
    
},1000*60);

app.listen(8080,()=>{
    console.log('Servidor rodando!')
});