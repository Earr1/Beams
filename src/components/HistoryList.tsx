import React from "react";
import { TransferLog } from "../types";
import { Download, Upload, CheckCircle2, XCircle, Clock, FileText, Film, Image, Package, HardDrive } from "lucide-react";

interface HistoryListProps {
  logs: TransferLog[];
  onClear: () => void;
}

export default function HistoryList({ logs, onClear }: HistoryListProps) {
  
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-4 h-4 text-emerald-400" />;
    if (type.startsWith("video/")) return <Film className="w-4 h-4 text-indigo-400" />;
    if (type.startsWith("text/") || type.includes("pdf") || type.includes("document")) {
      return <FileText className="w-4 h-4 text-amber-400" />;
    }
    return <Package className="w-4 h-4 text-blue-400" />;
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Header section with badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-slate-400" />
          Transmission Logs ({logs.length})
        </h2>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] text-indigo-400 font-bold hover:underline bg-transparent border-none outline-none"
            id="history-view-all-clear-btn"
          >
            Wipe all
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3 shadow-inner py-12">
          <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-300">No Transfers Logged</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[210px] mx-auto">
              Any files you send or receive will appear here with dynamic transmission checksum validation codes.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[440px] pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-3 bg-slate-800/30 p-3 rounded-2xl border border-slate-700/50 hover:border-slate-600/70 transition-all justify-between"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Visual direction symbol overlay on file type icon */}
                <div className="relative">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    {getFileIcon(log.type)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-slate-900 text-white shadow ${
                    log.direction === "send" ? "bg-indigo-600" : "bg-emerald-600"
                  }`}>
                    {log.direction === "send" ? (
                      <Upload className="w-2.5 h-2.5" />
                    ) : (
                      <Download className="w-2.5 h-2.5" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{log.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {formatSize(log.size)} • {log.direction === "send" ? "To" : "From"} <span className="text-indigo-400 font-bold">{log.device}</span>
                  </div>
                  {log.speed && (
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">{log.speed} • {log.timestamp}</div>
                  )}
                </div>
              </div>

              {/* Status Symbol representation */}
              <div className="shrink-0 flex items-center gap-1.5 pl-2">
                {log.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/20 shadow-lg shrink-0" />
                ) : log.status === "failed" ? (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
