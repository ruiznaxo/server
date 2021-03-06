import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Jaula } from '../entity/Jaula';
import { validate } from "class-validator";

import { SocketServer } from '../server';

export class JaulaController {

	public jaulaRepository = getRepository(Jaula);

	public async getJaulas(): Promise<Jaula[]>{
        const jaulaRepository = getRepository(Jaula);
        try {
            const jaulas = await jaulaRepository.find();
            return jaulas;            
        } catch (error) {
            return [];
        }
    }

	static all = async (req: Request, res: Response, next: NextFunction) => {
		const jaulaRepository = getRepository(Jaula);
		try {
			const jaula = await jaulaRepository.find();
			res.send(jaula);

		} catch (error) {
			res.status(500).send();
		}

	}

	static getOneById = async (req: Request, res: Response, next: NextFunction) => {
		const jaulaRepository = getRepository(Jaula);
		try {
			const jaula = await jaulaRepository.findOneOrFail(req.params.id);
			return jaula ? res.send(jaula) : res.status(404).send();
		} catch (error) {
			res.status(404).send();
			return;
		}
	}

	static saveJaula = async (req: Request, res: Response, next: NextFunction) => {
		const jaulaRepository = getRepository(Jaula);
		let { nombre, pesoPromedio, cantidadPeces, 
			idLinea, idSelectora, idDosificador } = req.body;
		let jaula = new Jaula();

		jaula.NOMBRE = nombre
		jaula.PESOPROMEDIO = pesoPromedio
		jaula.CANTIDADPECES = cantidadPeces
		jaula.IDLINEA = idLinea
		jaula.IDSELECTORA = idSelectora
		jaula.IDDOSIFICADOR = idDosificador

		//Validade if the parameters are ok
		const errors = await validate(jaula);
		if (errors.length > 0) {
			res.status(400).send(errors);
			return;
		}


        try {
            await jaulaRepository.save(jaula);
        } catch (e) {
            res.status(409).send({ msn: "Jaula ya existe"});
            return;
        }

        //If all ok, send 201 response
        res.status(201).send({ msn: "Jaula created"});
	}

	static deleteJaula = async (req: Request, res: Response, next: NextFunction) => {
		const jaulaRepository = getRepository(Jaula);
		let jaulaToRemove: Jaula;
		try {
			jaulaToRemove = await jaulaRepository.findOneOrFail(req.params.id);
		} catch (error) {
			res.status(404).send("Jaula not found");
			return;
		}
		let stat = await jaulaRepository.remove(jaulaToRemove);
        return stat ? res.send({msn: "Jaula Deleted Successfully"}) : res.json({ message: "error occured" })
		// return status ? status : res.json({message:"error occured, not found"})
	}


	static updateTasa = async (req: Request, res: Response) => {
		//Get the ID from the url
		const id = req.params.id;
		//Get values from the body
		const { tasa } = req.body;
		//Try to find jaula on database
		const jaulaRepository = getRepository(Jaula);
		let jaulaToUpdate;
		try {
			jaulaToUpdate = await jaulaRepository.findOneOrFail(id);
			console.log(jaulaToUpdate);
		} catch (error) {
			//If not found, send a 404 response
			res.status(404).send("Jaula not found");
			return;
		}
		//Validate the new values on model
		jaulaToUpdate.TASA = Number(tasa);
		console.log(jaulaToUpdate);
		const errors = await validate(jaulaToUpdate);
		if (errors.length > 0) {
			res.status(400).send(errors);
			return;
		}
		//Try to safe, if fails, that means jaulaname already in use
		try {
			await jaulaRepository.update(id, jaulaToUpdate);
		} catch (e) {
			res.status(409).send(e);
			return;
		}
		//After all send a 204 (no content, but accepted) response

		const server = SocketServer.instance;
		const jaula = await jaulaRepository.find();
		server.io.emit('test', { jaula });

		res.status(204).send();

	}

	static updateHabilitada = async (req: Request, res: Response) => {
		//Get the ID from the url
		const id = req.params.id;
		//Get values from the body
		const { habilitada } = req.body;
		//Try to find jaula on database
		const jaulaRepository = getRepository(Jaula);
		let jaulaToUpdate;
		try {
			jaulaToUpdate = await jaulaRepository.findOneOrFail(id);
		} catch (error) {
			//If not found, send a 404 response
			res.status(404).send("Jaula not found");
			return;
		}
		//Validate the new values on model
		jaulaToUpdate.HABILITADA = Number(habilitada);
		console.log(jaulaToUpdate);
		const errors = await validate(jaulaToUpdate);
		if (errors.length > 0) {
			res.status(400).send(errors);
			return;
		}
		//Try to safe, if fails, that means jaulaname already in use
		try {
			await jaulaRepository.update(id, jaulaToUpdate);
		} catch (e) {
			res.status(409).send(e);
			return;
		}
		//After all send a 204 (no content, but accepted) response

		const server = SocketServer.instance;
		const jaula = await jaulaRepository.find();
		server.io.emit('test', { jaula });

		res.status(204).send();

	}

	static updateParametros = async (req: Request, res: Response) => {
		//Get the ID from the url
		const id = req.params.id;
		//Get values from the body
		const { parametros } = req.body;

		console.log(parametros);
		
		//Try to find jaula on database
		const jaulaRepository = getRepository(Jaula);
		let jaulaToUpdate: Jaula;
		try {
			jaulaToUpdate = await jaulaRepository.findOneOrFail(id);
		} catch (error) {
			//If not found, send a 404 response
			res.status(404).send("Jaula not found");
			return;
		}
		//Validate the new values on model
		jaulaToUpdate.MONORRACION = Number(parametros.monorracion);
		jaulaToUpdate.POSICIONSELECTORA = Number(parametros.posicionSelectora);
		jaulaToUpdate.TIEMPOSOPLADO = Number(parametros.tiempoSoplado);
		jaulaToUpdate.TIEMPOESPERA = Number(parametros.tiempoEspera);
		jaulaToUpdate.HZSOPLADOR = Number(parametros.hzSoplador);
		jaulaToUpdate.TASA = Number(parametros.tasa);
		jaulaToUpdate.FACTORACTIVIDAD = Number(parametros.factorActividad);
		jaulaToUpdate.IDDOSIFICADOR = Number(parametros.iddosificador);
		console.log(jaulaToUpdate);
		const errors = await validate(jaulaToUpdate);
		if (errors.length > 0) {
			res.status(400).send(errors);
			return;
		}
		//Try to safe, if fails, that means jaulaname already in use
		try {
			await jaulaRepository.update(id, jaulaToUpdate);
		} catch (e) {
			res.status(409).send(e);
			return;
		}
		//After all send a 204 (no content, but accepted) response



		res.status(204).send();

	}

	static editJaula = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id = req.params.id;

        //Get values from the body
		const { nombre, pesoPromedio, cantidadPeces, 
			idLinea, idSelectora, idDosificador } = req.body;

        //Try to find silo on database
        const jaulaRepository = getRepository(Jaula);
        let jaula : Jaula;
        try {
            jaula = await jaulaRepository.findOneOrFail(id);
        } catch (error) {
            //If not found, send a 404 response
            res.status(404).send("Silo not found");
            return;
        }


        //Validate the new values on model
		jaula.NOMBRE = nombre
		jaula.PESOPROMEDIO = pesoPromedio
		jaula.CANTIDADPECES = cantidadPeces
		jaula.IDLINEA = idLinea
		jaula.IDSELECTORA = idSelectora
		jaula.IDDOSIFICADOR = idDosificador


        const errors = await validate(jaula);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        //Try to safe, if fails, that means siloname already in use
        try {
            await jaulaRepository.update(id, jaula);
        } catch (e) {
            res.status(409).send({msn: "No se editó la Jaula"});
            return;
        }
        //After all send a 204 (no content, but accepted) response
        res.status(204).send();

    }

}