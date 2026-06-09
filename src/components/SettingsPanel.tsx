import React, { useState } from "react";
import { DeviceConfig, PremiumState } from "../types";
import { Settings, Save, Trash2, ShieldAlert, Sparkles, Check, RefreshCw, Smartphone, Wifi, Radio } from "lucide-react";

interface SettingsPanelProps {
  deviceConfig: DeviceConfig;
  onSaveConfig: (config: DeviceConfig) => void;
  premiumState: PremiumState;
  onClearHistory: () => void;
  onTriggerPremium: () => void;
  useSimulatedP2P: boolean;
  onToggleP2PMode: (simulated: boolean) => void;
}

export default function SettingsPanel({
  deviceConfig,
  onSaveConfig,
  premiumState,
  onClearHistory,
  onTriggerPremium,
  useSimulatedP2P,
  onToggleP2PMode,
}: SettingsPanelProps) {
  const [deviceName, setDeviceName] = useState(deviceConfig.deviceName);
  const [avatarColor, setAvatarColor] = useState(deviceConfig.avatarColor);
  const [ipAddress, setIpAddress] = useState(deviceConfig.ipAddress);
  const [port, setPort] = useState(deviceConfig.port);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const colors = [
    { name: "indigo", value: "bg-indigo-600 text-white border-indigo-400" },
    { name: "emerald", value: "bg-emerald-600 text-white border-emerald-400" },
    { name: "rose", value: "bg-rose-600 text-white border-rose-400" },
    { name: "amber", value: "bg-amber-600 text-slate-900 border-amber-400" },
    { name: "purple", value: "bg-purple-600 text-white border-purple-400" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      deviceName,
      avatarColor,
      ipAddress,
      port,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 overflow-y-auto max-h-[510px] pr-1">
      {/* Settings Title */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400 animate-spin-slow" />
          On-Device Preferences
        </h2>
        <p className="text-xs text-slate-400">Configure local node identity and network simulations.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Device Name input */}
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            Device Public Name
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              id="settings-device-name-input"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Pixel 8 Pro"
              required
            />
          </div>
        </div>

        {/* Avatar color picker */}
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            Node Beacon Color
          </label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                type="button"
                id={`clr-btn-${c.name}`}
                key={c.name}
                onClick={() => setAvatarColor(c.name)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  c.name === avatarColor ? "scale-110 border-white" : "border-transparent opacity-60"
                } ${c.value.split(" ")[0]}`}
              />
            ))}
          </div>
        </div>

        {/* Network Emulation Parameters */}
        <div className="bg-slate-900 rounded-[28px] p-4 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Wifi className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Wi-Fi / Hotspot Config</h3>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] text-slate-400 font-bold">Simulated Local IP</label>
              <input
                type="text"
                value={ipAddress}
                id="settings-ip-input"
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                placeholder="192.168.43.1"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] text-slate-400 font-bold">Local Port</label>
              <input
                type="text"
                value={port}
                id="settings-port-input"
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                placeholder="8080"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-slate-400 font-bold block">P2P Network Mode</label>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                useSimulatedP2P ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
              }`}>
                {useSimulatedP2P ? "OFFLINE Wi-Fi" : "CLOUDRUN RELAY HOSTING"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="toggle-sim-mode-off"
                onClick={() => onToggleP2PMode(false)}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-[10px] font-bold ${
                  !useSimulatedP2P
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                Live Cloud Relay
              </button>
              <button
                type="button"
                id="toggle-sim-mode-on"
                onClick={() => onToggleP2PMode(true)}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-[10px] font-bold ${
                  useSimulatedP2P
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                Local WiFi Sim
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            id="save-preferences-btn"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile
              </>
            )}
          </button>
        </div>
      </form>

      {/* Premium monetization status details list */}
      <div className="bg-slate-900 rounded-[28px] p-4 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">License Status</h3>
        {premiumState.isPremium ? (
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div className="text-xs font-black text-amber-400">PREMIUM ACTIVE</div>
            </div>
            <span className="text-[10px] text-amber-500/60 font-mono font-bold">₦700/mo LICENSED</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <div className="text-xs font-bold text-rose-500">Free Account (Locked)</div>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">1 File Transfer Limit</span>
            </div>
            <button
              onClick={onTriggerPremium}
              id="activate-premium-btn"
              className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
              Unlock SwiftBeam Premium (₦700)
            </button>
          </div>
        )}
      </div>

      {/* Storage and Utilities */}
      <div className="bg-slate-900 rounded-[28px] p-4 border border-slate-800 space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Memory & Utilities</h3>
        <button
          onClick={onClearHistory}
          id="clear-logs-btn"
          className="w-full py-2.5 bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600/20 text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Transfer Logs
        </button>
      </div>

      {/* Small informative app credit signature complying with Anti-AI Slop (literal, small, humble labels) */}
      <div className="text-center pt-2">
        <p className="text-[10px] text-slate-600">SwiftBeam Local Transfer Node</p>
        <p className="text-[9px] text-slate-700 font-mono">v1.4.2-native (Capacitor Ready)</p>
      </div>
    </div>
  );
}
