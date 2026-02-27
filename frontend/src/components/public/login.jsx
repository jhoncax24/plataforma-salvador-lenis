import { useState } from "react";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const user = await login(form.username, form.password);

      alert("Bienvenido " + user.full_name);

      // 🔥 OBTENEMOS SU ROL
      const role = user.role;

      // 🔥 REDIRECCIÓN SEGÚN EL ROL
      if (role === "estudiante") navigate("/estudiante");
      else if (role === "docente") navigate("/docente");
      else if (role === "acudiente") navigate("/acudiente");
      else if (role === "admin") navigate("/"); // o a dashboard admin
      else navigate("/");

    } catch (err) {
      setError("Credenciales inválidas");
    }
  }

  return (
    <aside className="w-full md:w-1/3 flex flex-col justify-center bg-white shadow-md rounded-xl m-6 p-6">
      <h3 className="text-xl font-semibold mb-4 text-center">
        Ingreso a la plataforma
      </h3>

      <form className="space-y-4" onSubmit={handleLogin}>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label className="block mb-1 text-gray-700">Usuario:</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Introduce tu nombre de usuario"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Contraseña:</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Introduce tu contraseña"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#0033a0] hover:bg-[#134fb3] text-white font-medium py-2 rounded-lg transition"
        >
          Ingresar
        </button>
      </form>
    </aside>
  );
}
