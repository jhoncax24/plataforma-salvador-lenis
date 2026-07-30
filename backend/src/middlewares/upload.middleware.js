import multer from 'multer';

// 1. Configuramos Multer para guardar el archivo temporalmente en la memoria RAM
const storage = multer.memoryStorage();

// 2. Creamos la función de filtro para aceptar únicamente archivos PDF
const fileFilter = (req, file, cb) => {
  const imageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const pdfMime = 'application/pdf';
  if (imageMimes.includes(file.mimetype) || file.mimetype === pdfMime) {
    cb(null, true);
  } else {
    cb(new Error('Formato no válido. Por favor, sube imágenes (JPG, PNG, GIF, WEBP) o PDF.'), false);
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