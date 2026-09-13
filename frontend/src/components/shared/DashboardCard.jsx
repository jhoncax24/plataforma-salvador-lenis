import React from 'react';

export const DashboardCard = ({
  icono,
  titulo,
  children,
  accionPrincipal,
  onAccion,
}) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full transition-all hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-[#0033a0] border-b-2 border-gray-100 pb-3 flex items-center gap-2">
          {icono && <span className="p-2 bg-blue-50 rounded-full">{icono}</span>}
          <span>{titulo}</span>
        </h3>
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
      {accionPrincipal && (
        <button
          onClick={onAccion}
          className="w-full bg-[#0033a0] hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md mt-auto"
        >
          {accionPrincipal}
        </button>
      )}
    </div>
  );
};
