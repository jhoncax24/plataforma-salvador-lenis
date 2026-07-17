import multer from 'multer';

// 1. Configuramos Multer para guardar el archivo temporalmente en la memoria RAM
const storage = multer.memoryStorage();

// 2. Creamos la función de filtro para aceptar únicamente archivos PDF
const fileFilter = (req, file, cb) => {
  // Verificamos el mimetype del archivo
  if (file.mimetype === 'application/pdf') {
    // Si es PDF, aceptamos el archivo (pasando 'true' al callback)
    cb(null, true);
  } else {
    // Si no es PDF, rechazamos el archivo y enviamos un error
    cb(new Error('Formato no válido. Por favor, sube únicamente un archivo PDF.'), false);
  }
};

// 3. Inicializamos Multer con la configuración de almacenamiento y el filtro
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // Opcional: Limitamos el tamaño del archivo a 5MB para evitar colapsar la memoria
    fileSize: 5 * 1024 * 1024 
  }
});

export default upload;