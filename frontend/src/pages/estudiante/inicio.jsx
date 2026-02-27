import { useEffect, useState } from "react";
import axios from "axios";

import GradesCard from "../../components/estudiante/GradesCard";
import ScheduleCard from "../../components/estudiante/ScheduleCard";
import TasksCard from "../../components/estudiante/TasksCard";

export default function EstudianteInicio() {
  const [data, setData] = useState(null);
  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // futuro: obtener ID del localStorage según login
  const studentId = 1;

  useEffect(() => {
    axios
      .get(`${API}/api/students/${studentId}/dashboard`)
      .then((res) => setData(res.data))
      .catch(() => {
        setData({
          student: { full_name: "Juan Lucumi", student_id: studentId, grade_level: "Noveno", enrollment_number: "E-9001", guardian_contact: "Jhon Solano" },
          grades: [
            { course_name: "Lengua Castellana", grade: 4.0 },
            { course_name: "Ciencias Sociales", grade: 3.5 },
            { course_name: "Matemáticas", grade: 3.0 },
            { course_name: "Edu. Física", grade: 4.5 }
          ],
          schedule: [],
          tasks: []
        });
      });
  }, []);

  if (!data) return <div>Cargando...</div>;

  return (
    <div>
      {/* Encabezado del dashboard */}
      <div className="cesl-panel mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Buenos Días</h2>
          <div className="text-lg">{data.student.full_name}</div>
        </div>
        <div>
          <img
            src="/assets/profile_placeholder.png"
            alt="profile"
            className="w-20 h-20 rounded-full border"
          />
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GradesCard grades={data.grades} />
        <ScheduleCard schedule={data.schedule} student={data.student} />
        <TasksCard tasks={data.tasks} />
      </div>
    </div>
  );
}
