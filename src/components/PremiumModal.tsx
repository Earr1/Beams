import React, { useState } from "react";
import { Sparkles, Check, Lock, Loader2, Award, Zap, ShieldCheck } from "lucide-react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export default function PremiumModal({ isOpen, onClose, onSubscribe }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"details" | "verifying">("details");

  if (!isOpen) return null;

  const handleActivation = () => {
    setLoading(true);
    setStep("verifying");
    // Simulate real local secure handshake write
    setTimeout(() => {
      setLoading(false);
      onSubscribe();
      setStep("details");
    }, 2500);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col justify-end z-40 transition-opacity duration-300">
      {/* Tap out option at the top half */}
      <div className="flex-1" onClick={onClose}></div>

      {/* Slide up content */}
      <div 
        className="bg-[#0f172a] w-full p-8 rounded-t-[44px] border-t border-slate-800 shadow-[0_-15px_30px_rgba(0,0,0,0.6)] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Absolute Background Accent Design */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Grab bar */}
        <div className="w-12 h-1 bg-slate-700 mx-auto rounded-full mb-6 cursor-pointer" onClick={onClose}></div>

        {step === "details" ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/40 shrink-0">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  SwiftBeam Premium
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    ₦700/mo
                  </span>
                </h2>
                <p className="text-slate-400 text-xs">Empower your offline node sharing</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                <div className="w-6 h-6 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Batch & Folder Transfer</div>
                  <p className="text-[10px] text-slate-500">Send multi-gigabyte folders or multiples files at the same time without hassle.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                <div className="w-6 h-6 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Infinite Speeds & Zero Ad-logs</div>
                  <p className="text-[10px] text-slate-500">Bypass simulation bandwidth cap. Transfers run at full raw device limits.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                <div className="w-6 h-6 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Device Pairing Auto-discovery</div>
                  <p className="text-[10px] text-slate-500">Enable advanced on-device scanning for instant device-to-device network pairing.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                id="trigger-billing-auth-btn"
                onClick={handleActivation}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-2xl text-md hover:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Zap className="w-5 h-5 fill-slate-950" />
                Subscribe — ₦700 / Month
              </button>
              
              <button
                id="cancel-billing-btn"
                onClick={onClose}
                className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-2xl text-xs hover:bg-slate-800/80 transition-all text-center"
              >
                Maybe Later (Limit to Single File)
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Securing Local Gateway...</h3>
              <p className="text-slate-500 text-xs px-6">
                Writing subscription license flag to local cryptographic state logic directly on device.
              </p>
            </div>
            <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-[11px] text-amber-400 font-mono">
              TX_REF: SB-{Math.floor(Math.random() * 90000) + 10000}-NGN
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
