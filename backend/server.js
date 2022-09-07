const app=require('./app');
const dotenv=require('dotenv');
const connectDatabase=require('./config/database');

//Uncaught errors
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to uncaught exceptions`);
    process.exit(1);
})

//Config ie dotenv file connection
dotenv.config({path:"backend/config/config.env"})

//Connec t database

connectDatabase();

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})


//Unhandeled Promise Rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to unhandeled Promise rejection`);

    server.close(()=>{
        process.exit(1);
    })
})