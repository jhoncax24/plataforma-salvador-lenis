import React from 'react';


const Footer = ({ logo }) => {
  const footerStyle = {
    backgroundColor: '#3b4799',
    backgroundImage: `
      linear-gradient(45deg, 
        #3b4799 0px, #3b4799 35px,   
        #ffffff 35px, #ffffff 70px,  
        #d32f2f 70px, #d32f2f 105px, 
        transparent 105px            
      ),
      linear-gradient(-45deg, 
        #3b4799 0px, #3b4799 35px,   
        #ffffff 35px, #ffffff 70px,  
        #d32f2f 70px, #d32f2f 105px, 
        transparent 105px            
      )
    `,
    backgroundPosition: 'bottom left, bottom right',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <footer 
      style={footerStyle}
      className="w-full relative z-10 flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-8 pb-16 sm:pb-8 shadow-inner gap-8 md:gap-0"
    >
      
      {/* SECCIÓN IZQUIERDA: Info de Desarrolladores */}
      <div className="flex-1 flex flex-col items-center text-center text-white space-y-1.5 z-10">
        <p className="font-bold text-base md:text-lg">CESL Académico</p>
        <p className="text-sm md:text-base">Desarrolladores: Jhon, Brayan, Jefry</p>
        <p className="text-sm md:text-base">© 2026</p>
      </div>

      {/* SECCIÓN CENTRAL: Escudo Institucional */}
      <div className="flex-1 flex justify-center items-center z-10">
        <img 
          src="/logo.svg"
          alt="Logo Institucional" 
          loading="lazy"
          className="w-16 md:w-20 object-contain drop-shadow-md hover:scale-105 transition-transform" 
        />
      </div>

      {/* SECCIÓN DERECHA: Info de la Institución */}
      <div className="flex-1 flex flex-col items-center text-center text-white space-y-1.5 z-10">
        <p className="font-bold text-base md:text-lg">Centro Educativo Salvador Lenis</p>
        <p className="text-sm md:text-base">Dirección: Avenida 9 # 8 - 353, Rozo Centro</p>
        <p className="text-sm md:text-base">Rozo, Valle del Cauca</p>
      </div>
      
    </footer>
  );
};

export default Footer;
