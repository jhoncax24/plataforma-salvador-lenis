import { Router } from 'express';
// Asegúrate de importar buscarContactos junto a las demás funciones
import { enviarMensaje, obtenerConversacion, obtenerContactos, buscarContactos } from '../controllers/chat.controller.js';

const router = Router();

router.post('/mensaje', enviarMensaje);
router.get('/conversacion/:id_usuario1/:id_usuario2', obtenerConversacion);
router.get('/contactos/:id_usuario', obtenerContactos);

// AGREGAMOS ESTA NUEVA LÍNEA PARA EL BUSCADOR
router.get('/buscar/:id_usuario', buscarContactos);

export default router;