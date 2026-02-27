import logo from "../../assets/logo.webp";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-6 mt-8">
      <div className="max-w-7xl mx-auto flex justify-center">
        <img
          src={logo}
          alt="logo-footer"
          className="w-24 h-24 object-contain rounded-full bg-white p-2"
        />
      </div>
    </footer>
  );
}
