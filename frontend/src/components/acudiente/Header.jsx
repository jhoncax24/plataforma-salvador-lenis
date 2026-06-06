import logo from "../../assets/logo.webp";

export default function Header({ onOpenPerfil }) {
  return (
    <header className="bg-blue-800 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-8">
        <div>
          <h1 className="text-3xl font-bold">Bienvenidos al</h1>
          <p className="text-2xl font-semibold">
            Centro Educativo Salvador Lenis
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <img
            src={logo}
            alt="logo"
            className="w-24 h-24 object-contain rounded-full bg-white p-2"
          />
        </div>
      </div>
    </header>
  );
}
