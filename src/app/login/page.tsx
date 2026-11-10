"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("teamowee");
  const [password, setPassword] = useState("12345678");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Username atau password salah.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Terjadi gangguan jaringan. Silakan coba kembali.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern selection:bg-byonBlue selection:text-white">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-slateCard border border-slateBorder rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-byonBlue shadow-xl shadow-blue-600/30 bg-carbon">
              <Image
                src="/logo.jpg"
                alt="Logo Team Oweee"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-byonBlue/20 text-blue-400 border border-blue-500/30 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>TEAM OWEEE • PORPROV XIV KALBAR</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Smart Admin Muaythai
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Silakan login untuk mengelola data atlet, jadwal, dan undian turnamen.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2.5 text-xs text-rose-200 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username Administrator
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="teamowee"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-carbon border border-slateBorder text-sm text-white placeholder-slate-500 focus:outline-none focus:border-byonBlueLight min-h-[44px]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-carbon border border-slateBorder text-sm text-white placeholder-slate-500 focus:outline-none focus:border-byonBlueLight min-h-[44px]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-byonBlue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] min-h-[44px] cursor-pointer"
            >
              <span>{loading ? "Memverifikasi..." : "Masuk ke Sistem"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-2 text-center text-[11px] text-slate-500">
            <span>Sistem Database Atlet Resmi Porprov XIV Kalbar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
