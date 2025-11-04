import express from 'express';
import apicache from 'apicache';
import { SalonesControlador }  from '../../controladores/salonesControlador.js';
import {validarId, validarCrearSalon, validarActualizarSalon} from '../../middleware/validacionSalones.js';

const router = express.Router();
const salonesControlador = new SalonesControlador();
const cache = apicache.middleware;

// BREAD router para salones
router.get('/', cache('5 minutes'),salonesControlador.obtenerTodos);

router.get('/:id', validarId, cache('2 minutes'),salonesControlador.obtenerPorId);

router.post('/', validarCrearSalon, salonesControlador.crear); 

router.put('/:id', validarActualizarSalon, salonesControlador.actualizar);

router.delete('/:id', validarId, salonesControlador.eliminar); 


export { router };