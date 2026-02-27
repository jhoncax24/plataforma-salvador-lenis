import { useOutletContext } from "react-router-dom";

import Certificados from "../../components/acudiente/Certificados";
import NotasPeriodo from "../../components/acudiente/NotasPeriodo";
import Calendario from "../../components/acudiente/Calendario";

export default function AcudienteInicio() {
  const { hijos, handleVerNotas } = useOutletContext();

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Panel del Acudiente</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Certificados />
        <NotasPeriodo hijos={hijos} onVerNotas={handleVerNotas} />
        <Calendario />
      </div>
    </div>
  );
}
