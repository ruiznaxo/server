import "reflect-metadata";
import {createConnection} from "typeorm";
import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet"
import  cors from "cors"
import {Request, Response} from "express";
import routes from "./routes/";
import {User} from "./entity/User";
import {UserController} from "./controllers/UserController";
import { SocketServer } from './server';

createConnection().then(async connection => {

    // create express app
    // const app = express();

    // start express server
    // app.listen(3000);
    const server = SocketServer.instance;

    server.getApp().use(cors());
    server.getApp().use(helmet());
    server.getApp().use(bodyParser.json());
    server.getApp().use(bodyParser.urlencoded({extended: true}));
    server.getApp().use("/api", routes);
    server.start(()=> {
        console.log(`Servidor en puerto ${server.port}`);    
    });

    // let app = new SocketServer().getApp();
    // console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results");

    // //Call MiddleWares
    // app.use(cors());
    // app.use(helmet());
    // app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({extended: true}));
    // app.use("/api", routes);
    // app.start()

    // register express routes from defined application routes
    // Routes.forEach(route => {
    //     (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
    //         const result = (new (route.controller as any))[route.action](req, res, next);
    //         if (result instanceof Promise) {
    //             result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

    //         } else if (result !== null && result !== undefined) {
    //             res.json(result);
    //         }
    //     });
    // });
    

}).catch(error => console.log(error));


