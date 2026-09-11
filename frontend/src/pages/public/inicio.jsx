import EventosInicio from "../../components/public/eventosInicio";
import Login from "../../components/public/login";

export default function Inicio() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-center">
      <EventosInicio />
      <Login />
    </div>
  );
}
