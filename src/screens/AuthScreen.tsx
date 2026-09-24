import { useState } from "react";
import { User } from "../store/auth";

interface Props {
  onRegister: (u: User) => void;
}

export default function AuthScreen({ onRegister }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "register") {
      if (!name.trim()) { setError("Ingresa tu nombre."); return; }
      if (!email.includes("@")) { setError("Correo inválido."); return; }
      if (password.length < 6) { setError("Contraseña mínimo 6 caracteres."); return; }
      onRegister({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    } else {
      if (!email.includes("@") || password.length < 1) { setError("Credenciales incorrectas."); return; }
      onRegister({ name: email.split("@")[0], email: email.trim(), phone: "" });
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    color: "#1e293b",
    background: "#f8fafc",
    outline: "none",
    fontFamily: "Outfit, sans-serif",
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: "#eff6ff" }}>
          💧
        </div>
        <div className="text-2xl font-bold" style={{ color: "#1e293b" }}>AlerTa Panamá</div>
        <div className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Sistema Nacional de Alerta de Inundaciones
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-6 mb-6 flex rounded-xl p-1" style={{ background: "#e2e8f0" }}>
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: mode === m ? "#fff" : "transparent",
              color: mode === m ? "#1e293b" : "#64748b",
              boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {m === "login" ? "Iniciar sesión" : "Registrarse"}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={submit} className="flex-1 px-6 flex flex-col gap-3">
        {mode === "register" && (
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#64748b" }}>Nombre completo</label>
            <input
              style={inputStyle}
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#64748b" }}>Correo electrónico</label>
          <input
            style={inputStyle}
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {mode === "register" && (
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#64748b" }}>Teléfono <span style={{ color: "#cbd5e1" }}>(opcional)</span></label>
            <input
              style={inputStyle}
              type="tel"
              placeholder="+507 6000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#64748b" }}>Contraseña</label>
          <input
            style={inputStyle}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />
        </div>

        {error && (
          <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-semibold text-white text-base mt-2 transition-opacity active:opacity-80"
          style={{ background: "#3b82f6" }}
        >
          {mode === "login" ? "Ingresar" : "Crear cuenta"}
        </button>

        {mode === "register" && (
          <p className="text-center text-xs mt-2" style={{ color: "#94a3b8" }}>
            Al registrarte aceptas recibir alertas de emergencia por correo y SMS.
          </p>
        )}
      </form>

      <div className="pb-10 px-6 mt-4 text-center text-xs" style={{ color: "#cbd5e1" }}>
        ETESA · SINAPROC · GEOGloWS v2
      </div>
    </div>
  );
}
