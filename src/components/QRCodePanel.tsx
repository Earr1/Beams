import React, { useEffect, useRef } from "react";
import { toCanvas } from "qrcode";
import { Clipboard, Check, Share2, Globe } from "lucide-react";

interface QRCodePanelProps {
  value: string;
  subtext?: string;
  ipAddress?: string;
}

export default function QRCodePanel({ value, subtext, ipAddress }: QRCodePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (canvasRef.current && value) {
      toCanvas(
        canvasRef.current,
        value,
        {
          width: 160,
          margin: 1,
          color: {
            dark: "#0f172a", // Slate-900 matching Slate design
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error);
        }
      );
    }
  }, [value]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="relative group">
      {/* Visual background neon glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 blur-xl opacity-75"></div>
      
      <div className="relative bg-white rounded-3xl p-5 flex flex-col items-center justify-center">
        {/* Real QR Code Canvas */}
        <div className="p-2 bg-white border-2 border-slate-100 rounded-2xl shadow-inner flex items-center justify-center">
          <canvas ref={canvasRef} className="w-40 h-40 rounded-xl" />
        </div>

        {/* Info below visual */}
        <div className="mt-4 text-slate-900 text-center w-full">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <Globe className="w-3 h-3 text-emerald-500" />
            Scan QR Code to Download
          </div>
          
          <div className="mt-1 font-mono text-sm font-black text-slate-800 break-all select-all flex items-center justify-center gap-1 bg-slate-100 p-2 rounded-xl">
            <span className="truncate max-w-[180px]">{ipAddress || value}</span>
            <button 
              onClick={copyToClipboard} 
              className="text-indigo-600 hover:text-indigo-800 p-1 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
              title="Copy link address"
              id="copy-qr-link-btn"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Clipboard className="w-4 h-4" />}
            </button>
          </div>

          {subtext && (
            <p className="text-[11px] text-slate-500 mt-2 font-medium leading-relaxed max-w-[240px] mx-auto">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
