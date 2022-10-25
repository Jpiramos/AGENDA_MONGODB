let appointment = require('../models/Appointment');
let mongoose = require('mongoose');
let AppointmentFactory = require('../factories/AppointmentFactory');
let mailer = require('nodemailer')


const appo = mongoose.model('Appointment',appointment)
class AppointmentService{

    async Create(name,email,description,cpf,date,time){
        var newappo = new appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified:false
        });
        try{
            await newappo.save();
            return true;
        }catch(err){
            console.log(err)
            return false;
        } 
    }
    async GetAll(showFinished){

        if(showFinished){
            return await appo.find();
        }else{
            var appos = await appo.find({'finished':false});
            var appointments = [];

            appos.forEach(appointment=>{

                if(appointment.date != undefined){
                    appointments.push(AppointmentFactory.Build(appointment))
                }
            });

            return appointments;
        }
    }
    async GetById(id){
        try{
            let event = await appo.findOne({'_id':id});
            return event
        }catch(err){
            console.log(err);
        }   
    }
    async Finish(id){
        try{
            await appo.findByIdAndUpdate(id,{finished:true})
            return true;
        }catch(err){
            console.log(err)
            return false;
        }
    }
    async Search(query){
        try{
            var appos = await appo.find().or([{email:query},{cpf:query}])
            return appos
        }catch(err){
            console.log(err)
            return []
        } 
    }
    async SendNotification(){
        let appos = await this.GetAll(false);

        let transporter = mailer.createTransport({
            host:'smtp.mailtrap.io',
            port:465,
            service:'gmail',
            auth:{
                user:'7e3ab67dec161a',
                pass:'fbfb4cb9e66787',

            }
        });

        appos.forEach(app=>{

            let date = app.start.getTime();
            let hour = 1000*60*60;
            let gap = date-Date.now();

            if(gap<=hour){


                if(!app.notified){

                    appo.findByIdAndUpdate(app.id,{notified:true});

                    transporter.sendMail({


                        from:'João Pedro Ramos <DentalClean@outlook.com.br>',
                        to: app.email,
                        subject: 'Consulta agendada está para chegar, DentalClean',
                        text:'Sua consulta na DentalClean está agendada para daqui a 1 hora'

                    }).then(()=> {




                    }).catch(err=>{
                        console.log(err)
                    })
                }   
            }
        })
    }
}

module.exports = new AppointmentService();