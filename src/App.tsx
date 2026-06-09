import React, { useState, useEffect, useRef } from "react";
import { 
  TransferLog, 
  SharedFile, 
  DeviceConfig, 
  PremiumState 
} from "./types";
import QRCodePanel from "./components/QRCodePanel";
import PremiumModal from "./components/PremiumModal";
import SettingsPanel from "./components/SettingsPanel";
import HistoryList from "./components/HistoryList";
import { 
  Wifi, 
  Smartphone, 
  Upload, 
  Download, 
  History, 
  Settings as SettingsIcon, 
  Grid, 
  Loader2, 
  Sparkles, 
  ArrowRight, 
  FolderPlus,
  RefreshCw,
  HardDriveUpload,
  User,
  ExternalLink,
  SmartphoneNfc,
  CheckCircle2,
  Lock,
  Plus
} from "lucide-react";

export default function App() {
  // --- STATE PERSISTENCE HANDLERS (localStorage) ---
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig>(() => {
    const saved = localStorage.getItem("swiftbeam_device_config");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      deviceName: "Swift Nodes - Node 1",
      avatarColor: "indigo",
      ipAddress: "192.168.43.1",
      port: "8080"
    };
  });

  const [logs, setLogs] = useState<TransferLog[]>(() => {
    const saved = localStorage.getItem("swiftbeam_transfer_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Seed beautiful initial logs for premium design look-and-feel
    return [
      {
        id: "log-seed-1",
        name: "IMG_2026_06_09.jpg",
        size: 2516582, // 2.4 MB
        type: "image/jpeg",
        status: "completed",
        direction: "send",
        device: "Galaxy S24 Ultra",
        timestamp: "5 mins ago",
        speed: "12.4 MB/s"
      },
      {
        id: "log-seed-2",
        name: "Contracts_Archive.zip",
        size: 149002240, // 142.1 MB
        type: "application/zip",
        status: "completed",
        direction: "receive",
        device: "Pixel 8 Pro",
        timestamp: "20 mins ago",
        speed: "34.8 MB/s"
      }
    ];
  });

  const [premium, setPremium] = useState<PremiumState>(() => {
    const saved = localStorage.getItem("swiftbeam_premium_license");
    return {
      isPremium: saved === "true",
      nigeriaPrice: "₦700/mo"
    };
  });

  // --- UI NAVIGATION & TAB STATE ---
  const [activeTab, setActiveTab] = useState<"transfer" | "history" | "settings">("transfer");
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [useSimulatedP2P, setUseSimulatedP2P] = useState<boolean>(() => {
    const saved = localStorage.getItem("swiftbeam_p2p_mode");
    return saved === "true" || saved === null; // Default to simulated wifi for P2P feeling
  });

  // --- TRANSFERS FEED STATE ---
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState("0 KB/s");
  
  // Hosted Session Output (For QR Code generate)
  const [hostedFile, setHostedFile] = useState<SharedFile | null>(null);
  const [directDownloadUrl, setDirectDownloadUrl] = useState("");
  
  // Receiver Input Simulation
  const [receiverMode, setReceiverMode] = useState<"idle" | "listening" | "pulling">("idle");
  const [simulatedReceiverProgress, setSimulatedReceiverProgress] = useState(0);
  const [scanInputUrl, setScanInputUrl] = useState("");
  const [pairingPeeps, setPairingPeeps] = useState(6);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem("swiftbeam_device_config", JSON.stringify(deviceConfig));
  }, [deviceConfig]);

  useEffect(() => {
    localStorage.setItem("swiftbeam_transfer_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("swiftbeam_premium_license", premium.isPremium ? "true" : "false");
  }, [premium]);

  useEffect(() => {
    localStorage.setItem("swiftbeam_p2p_mode", useSimulatedP2P ? "true" : "false");
  }, [useSimulatedP2P]);

  // --- METRIC HELPERS ---
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // --- SUBMIT FILE FOR PEER STREAMING ---
  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    if (filesArray.length === 0) return;

    // Check pre-condition for multiple file select
    if (filesArray.length > 1 && !premium.isPremium) {
      setPremiumOpen(true);
      // Fallback: strictly safe Single file limit policy
      setPendingFiles([filesArray[0]]);
      return;
    }

    setPendingFiles(filesArray);
  };

  // --- MOCK OR ACTUALLY HOST FILE TRANSMISSION SENDER ACTION ---
  const startSharingHost = async () => {
    if (pendingFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadPercent(5);
    setTransferSpeed("120 KB/s");

    const activeFile = pendingFiles[0];

    // Read file payload
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Content = event.target?.result as string;
      const fileId = "sb-" + Math.floor(Math.random() * 1000000);

      try {
        if (!useSimulatedP2P) {
          // --- REAL LOCAL HTTP CONNECT BACKEND TRANSACTIONS ---
          setTransferSpeed("1.2 MB/s");
          setUploadPercent(30);

          const payload = {
            id: fileId,
            name: activeFile.name,
            type: activeFile.type,
            size: activeFile.size,
            data: base64Content
          };

          setUploadPercent(55);
          setTransferSpeed("5.4 MB/s");

          // Post to server storage in-memory
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error("Local HTTP container failed payload write");
          }

          const responseData = await response.json();
          setUploadPercent(100);
          setTransferSpeed("Fully Shared");
          setIsUploading(false);

          const fullAbsoluteUrl = `${window.location.origin}${responseData.downloadUrl}`;
          
          setHostedFile({
            id: fileId,
            name: activeFile.name,
            size: activeFile.size,
            type: activeFile.type,
            url: fullAbsoluteUrl
          });
          setDirectDownloadUrl(fullAbsoluteUrl);

        } else {
          // --- DIRECT SIMULATED WI-FI DIRECT HOTSPOT TRANSFERS ---
          // Speeds climb rapidly to replicate super fast local peer interface
          let prog = 10;
          const interval = setInterval(() => {
            prog += 15;
            setUploadPercent(Math.min(prog, 100));
            setTransferSpeed(`${(10 + Math.random() * 15).toFixed(1)} MB/s`);

            if (prog >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              setTransferSpeed("Online Hosted");

              const mockP2PUrl = `http://${deviceConfig.ipAddress}:${deviceConfig.port}/download/${fileId}`;
              setHostedFile({
                id: fileId,
                name: activeFile.name,
                size: activeFile.size,
                type: activeFile.type,
                url: mockP2PUrl
              });
              setDirectDownloadUrl(mockP2PUrl);
            }
          }, 300);
        }

        // Add history log instantly
        const newLog: TransferLog = {
          id: fileId,
          name: activeFile.name,
          size: activeFile.size,
          type: activeFile.type,
          status: "completed",
          direction: "send",
          device: "Connected Clients Network",
          timestamp: "Just Now",
          speed: useSimulatedP2P ? "18.2 MB/s" : "8.4 MB/s"
        };
        setLogs(prev => [newLog, ...prev]);

      } catch (err) {
        console.error("Transmission host setup failed:", err);
        setIsUploading(false);
        setTransferSpeed("Failed");
      }
    };

    reader.readAsDataURL(activeFile);
  };

  // --- TRIGGER SECURE SUBSCRIPTION SEQUENCE ---
  const handlePremiumSubscribe = () => {
    setPremium({ isPremium: true, nigeriaPrice: "₦700/mo" });
    setPremiumOpen(false);
  };

  const handleClosePremium = () => {
    setPremiumOpen(false);
  };

  // --- RECEIVER SCAN MANUALLY & DOWNLOAD INTERCEPTION ---
  const handleStartListening = () => {
    setReceiverMode("listening");
    setScanInputUrl("");
  };

  const handleSimulateReceiveLink = async () => {
    if (!scanInputUrl && hostedFile) {
      // Automatic loopback link check
      setScanInputUrl(directDownloadUrl);
    }
    
    setReceiverMode("pulling");
    setSimulatedReceiverProgress(5);
    
    // Simulate active binary checksum evaluation and pull
    let prog = 5;
    const interval = setInterval(() => {
      prog += 20;
      setSimulatedReceiverProgress(Math.min(prog, 100));
      
      if (prog >= 100) {
        clearInterval(interval);
        setReceiverMode("idle");
        
        // Add Receive log
        const recvLogId = "sb-recv-" + Math.floor(Math.random() * 90000);
        const resolvedFileName = hostedFile ? hostedFile.name : "Incoming_Beam_File.zip";
        const resolvedFileSize = hostedFile ? hostedFile.size : 48900000;
        const resolvedFileType = hostedFile ? hostedFile.type : "application/octet-stream";

        const newRecvLog: TransferLog = {
          id: recvLogId,
          name: resolvedFileName,
          size: resolvedFileSize,
          type: resolvedFileType,
          status: "completed",
          direction: "receive",
          device: deviceConfig.deviceName,
          timestamp: "Just Now",
          speed: "24.5 MB/s"
        };
        setLogs(prev => [newRecvLog, ...prev]);

        // Actually trigger standard direct download if it's a real live address
        if (hostedFile && !useSimulatedP2P) {
          window.open(hostedFile.url, "_blank");
        } else {
          // Alert virtual completion
          alert(`Successfully simulated receiving "${resolvedFileName}" at high Wi-Fi speed.`);
        }
      }
    }, 450);
  };

  const cancelSendingFile = () => {
    setPendingFiles([]);
    setHostedFile(null);
    setDirectDownloadUrl("");
  };

  const clearHistoryLogs = () => {
    setLogs([]);
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#020617] text-slate-200 font-sans flex items-center justify-center p-4 md:p-8 overflow-hidden select-none">
      
      {/* 
         DESIGN PATTERN COMPLYING TO:
         - Standard Apple / Slate mobile frames with clean border padding.
         - Double side stats widget badges on top-right desktop layout fallback.
      */}
      <div className="w-[390px] h-[720px] bg-[#0f172a] rounded-[48px] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Top Navbar Section with Connection Speed & Pulsating LED */}
        <div className="px-6 pt-10 pb-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-slate-800">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Node Active
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              SwiftBeam
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            </h1>
          </div>
          
          {/* User profile with dynamic customizable avatar border */}
          <div 
            onClick={() => setActiveTab("settings")}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-indigo-400/30 cursor-pointer hover:scale-105 transition-transform bg-indigo-600 shadow-lg"
            title="Configure Device"
          >
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* --- MAIN TAB BODY GRID PORTAL --- */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 pb-24">
          
          {activeTab === "transfer" && (
            <>
              {/* Quick Choice Grid: Send vs Receive */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  id="pick-files-trigger-btn"
                  onClick={triggerFilePicker}
                  className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-3xl shadow-lg shadow-indigo-900/20 flex flex-col items-center justify-center space-y-2 group active:scale-95 transition-all text-left border border-indigo-500/30"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-sm text-white">Send Files</span>
                  <span className="text-[9px] text-indigo-200 opacity-80">Local Wifi P2P</span>
                </button>

                <button
                  type="button"
                  id="receive-mode-trigger-btn"
                  onClick={handleStartListening}
                  className={`border p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all ${
                    receiverMode !== "idle"
                      ? "bg-emerald-500/20 border-emerald-500 text-white"
                      : "bg-slate-800/50 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Download className="w-6 h-6 text-emerald-500" />
                  </div>
                  <span className="font-bold text-sm">Receive Files</span>
                  <span className="text-[9px] text-emerald-400 font-mono">Listening...</span>
                </button>
              </div>

              {/* Secret file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
                id="hidden-native-file-picker"
              />

              {/* Selected Pendings list queue or current stream progress bar */}
              {pendingFiles.length > 0 && !hostedFile && (
                <div className="bg-slate-900 rounded-[32px] p-5 border border-slate-800 shadow-inner space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-400">Selected Payload</h3>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {pendingFiles.length} File{pendingFiles.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {pendingFiles.map((pf, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-900">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 border border-slate-800">
                        <HardDriveUpload className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{pf.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">
                          {formatSize(pf.size)} • {pf.type || "binary/data"}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Transfer host processing triggers */}
                  {isUploading ? (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-slate-400">Networking Stream Speed</span>
                        <span className="text-indigo-400 font-bold">{transferSpeed}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all duration-200" 
                          style={{ width: `${uploadPercent}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-[10px] text-indigo-400 font-bold">{uploadPercent}% Encoded</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={cancelSendingFile}
                        id="cancel-draft-files-btn"
                        className="py-3 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl text-xs font-bold transition-all text-center"
                      >
                        Wipe
                      </button>
                      <button
                        onClick={startSharingHost}
                        id="start-p2p-hosting-btn"
                        className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all text-center shadow-md shadow-indigo-950"
                      >
                        Host Locally
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic QR Display Panel when files are ready */}
              {hostedFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Active Host Beacon</span>
                    <button 
                      onClick={cancelSendingFile}
                      className="text-xs font-bold text-rose-500 hover:underline"
                      id="close-host-sharing-btn"
                    >
                      Stop Sharing
                    </button>
                  </div>
                  
                  <QRCodePanel 
                    value={directDownloadUrl} 
                    ipAddress={useSimulatedP2P ? `${deviceConfig.ipAddress}:${deviceConfig.port}/download/${hostedFile.id}` : directDownloadUrl}
                    subtext={`Shared payload: "${hostedFile.name}". Open standard QR app to download immediately on identical network.`}
                  />

                  {/* Loopback quick test receiver widget inside iframe layout */}
                  <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 text-center space-y-2">
                    <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Wired Iframe Scanner Simulator</h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      No second phone? Simulates another peer scanning safety QR inside this preview container instantly.
                    </p>
                    <button
                      onClick={handleSimulateReceiveLink}
                      id="simulate-loop-scan-btn"
                      className="w-full py-2 bg-slate-950 border border-indigo-500/30 hover:bg-slate-900 text-indigo-400 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <SmartphoneNfc className="w-3.5 h-3.5" />
                      Loopback Receiver Test
                    </button>
                  </div>
                </div>
              )}

              {/* RECEIVER SIMULATOR LISTENING PORT */}
              {receiverMode !== "idle" && (
                <div className="bg-slate-900 rounded-[32px] p-5 border border-emerald-500/30 shadow-inner space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Wi-Fi Receiver Listening...</h3>
                    </div>
                    <button 
                      onClick={() => setReceiverMode("idle")} 
                      className="text-[10px] text-slate-400 hover:text-white"
                      id="close-receiver-mode-btn"
                    >
                      Cancel
                    </button>
                  </div>

                  {receiverMode === "listening" && (
                    <div className="space-y-3">
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Your device is currently acting as a scanning client. Paste a SwiftBeam transfer url or click simulator to capture.
                      </p>
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={scanInputUrl}
                          onChange={(e) => setScanInputUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-400 placeholder-slate-600 focus:outline-none"
                          placeholder="Paste Direct Download Link / Address"
                          id="manual-receive-link-input"
                        />
                        
                        <button
                          onClick={handleSimulateReceiveLink}
                          disabled={!scanInputUrl && !hostedFile}
                          id="execute-manual-receive-btn"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolve Network Address & Pull
                        </button>
                      </div>
                    </div>
                  )}

                  {receiverMode === "pulling" && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-emerald-400">Stream Transmission Verified</span>
                        <span className="text-emerald-400 font-bold">{simulatedReceiverProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${simulatedReceiverProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-slate-500 text-center font-mono animate-pulse">
                        Pulling blocks from peer endpoint...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Small summary showing current transfer counts and historical preview compliance */}
              <div className="space-y-3">
                <HistoryList logs={logs.slice(0, 2)} onClear={clearHistoryLogs} />
              </div>
            </>
          )}

          {activeTab === "history" && (
            <HistoryList logs={logs} onClear={clearHistoryLogs} />
          )}

          {activeTab === "settings" && (
            <SettingsPanel
              deviceConfig={deviceConfig}
              onSaveConfig={setDeviceConfig}
              premiumState={premium}
              onClearHistory={clearHistoryLogs}
              onTriggerPremium={() => setPremiumOpen(true)}
              useSimulatedP2P={useSimulatedP2P}
              onToggleP2PMode={setUseSimulatedP2P}
            />
          )}

        </div>

        {/* Bottom Tab Navigation Bar with Immersive UI details (Settings, History, Transfer) */}
        <div className="bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 p-4 absolute bottom-0 left-0 w-full flex items-center justify-around z-30">
          <button
            type="button"
            id="nav-tab-transfer"
            onClick={() => setActiveTab("transfer")}
            className={`flex flex-col items-center transition-colors pb-1 ${
              activeTab === "transfer" ? "text-indigo-400 scale-105" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Grid className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold">Transfer</span>
          </button>

          <button
            type="button"
            id="nav-tab-history"
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center transition-colors pb-1 ${
              activeTab === "history" ? "text-indigo-400 scale-105" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <History className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold">History</span>
          </button>

          <button
            type="button"
            id="nav-tab-settings"
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center transition-colors pb-1 ${
              activeTab === "settings" ? "text-indigo-400 scale-105" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <SettingsIcon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>

        {/* Apple/Capacitor Home Indicator Bar */}
        <div className="absolute bottom-1 w-full flex justify-center pointer-events-none">
          <div className="w-32 h-1 bg-slate-700/80 rounded-full"></div>
        </div>

        {/* --- PREMIUM MONETIZATION DRAWER WALL OVERLAY --- */}
        <PremiumModal 
          isOpen={premiumOpen} 
          onClose={handleClosePremium} 
          onSubscribe={handlePremiumSubscribe} 
        />

      </div>

      {/* 
         OUTER CONTAINER SYSTEM DESIGN BADGES (Matches the "Immersive UI" design specification)
         - Sells the theme perfectly. Includes real live configuration info.
      */}
      <div className="hidden lg:flex absolute top-10 right-10 flex-col gap-3 pointer-events-auto z-10">
        <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-2xl w-60">
          <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Premium License Engine</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${premium.isPremium ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-rose-500"}`}></span>
              <span className="font-black text-xs text-white uppercase tracking-tight">
                {premium.isPremium ? "₦700 PRO UNLOCKED" : "LOCKED (FREE DEMO)"}
              </span>
            </div>
            {!premium.isPremium && (
              <button 
                onClick={() => setPremiumOpen(true)}
                className="text-[10px] bg-amber-500 text-black px-2 py-1 rounded-xl font-bold hover:scale-105 transition-all"
                id="floating-unlock-premium-btn"
              >
                Buy PRO
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-2xl w-60 space-y-2">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Peer Connection</div>
          <div className="flex -space-x-2 items-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-905 bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">ME</div>
            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">P1</div>
            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">+{pairingPeeps}</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Sim Network</span>
            <span className="text-indigo-400 font-bold">{useSimulatedP2P ? "Wi-Fi Hotspot" : "P2P Web Sockets"}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
