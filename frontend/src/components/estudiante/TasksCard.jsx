import React from "react";

export default function TasksCard() {
  return (
    <div className="bg-[#e9ecef] border-2 border-gray-400 rounded flex flex-col h-full shadow-sm">
      <h3 className="text-xl text-center text-gray-800 py-4 border-b-2 border-gray-400 m-0">Tareas/Pendientes</h3>
      
      <div className="bg-white flex-1 p-6 flex flex-col">
        <p className="text-center text-gray-800 mb-6">Tareas más cercanas a la fecha</p>

        {/* Cajas de colores del Mockup */}
        <div className="space-y-2 mb-6">
          <div className="bg-[#20c997] p-2 border border-gray-600 text-xs font-semibold text-gray-900">
            28 de Octubre, Entrega Proyecto Final
          </div>
          <div className="bg-[#ffc107] p-2 border border-gray-600 text-xs font-semibold text-gray-900">
            30 de Octubre, Examen Final Biología
          </div>
          <div className="bg-[#28a745] p-2 border border-gray-600 text-xs font-semibold text-white">
            3 de Noviembre, Examen Final
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button className="bg-[#0033a0] text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition-colors w-3/4">
            Ver Más Tareas
          </button>
        </div>

        {/* Calendario */}
        <div className="mt-auto border border-gray-200 rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800 text-lg">February 2025</h4>
            <div className="flex gap-2 text-gray-400">
              <button className="hover:text-black transition-colors">&lt;</button>
              <button className="hover:text-black transition-colors">&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-bold text-[#0033a0] mb-2">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>
          <div className="grid grid-cols-7 text-center text-sm gap-y-3 text-gray-600">
            <div className="text-gray-300">29</div><div className="text-gray-300">30</div><div className="text-gray-300">31</div>
            <div>1</div><div>2</div><div>3</div><div>4</div>
            <div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div>
            <div>12</div><div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div>
            <div>19</div><div>20</div><div>21</div><div>22</div><div>23</div><div>24</div><div>25</div>
            <div>26</div><div>27</div><div>28</div>
            <div className="text-gray-300">1</div><div className="text-gray-300">2</div><div className="text-gray-300">3</div><div className="text-gray-300">4</div>
          </div>
        </div>
      </div>
    </div>
  );
}