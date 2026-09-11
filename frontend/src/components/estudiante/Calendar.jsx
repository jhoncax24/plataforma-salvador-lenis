// src/components/Calendar.jsx
import React, { useState } from "react";

export default function Calendar({ onDayClick }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);

  const monthLabel = currentMonth.toLocaleString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const getDaysInMonth = () => {
    return new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
  };

  const firstDayIndex = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const changeMonth = (value) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + value, 1)
    );
  };

  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: getDaysInMonth() }, (_, i) => i + 1);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <h2 className="capitalize font-semibold text-lg">{monthLabel}</h2>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>

      <div className="grid grid-cols-7 font-semibold mb-2 text-center text-xs sm:text-sm">
        <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div>
        <div>Jue</div><div>Vie</div><div>Sáb</div>
      </div>

      <div className="grid grid-cols-7 auto-rows-[90px] sm:auto-rows-[120px] gap-2">
        {[...blanks, ...days].map((day, idx) => (
          <div
            key={idx}
            onClick={() =>
              day && onDayClick(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
            }
            className={`h-24 flex items-center justify-center border rounded cursor-pointer ${
              day ? "hover:bg-blue-100" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
