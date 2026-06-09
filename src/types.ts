export interface TransferLog {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "completed" | "failed" | "transferring";
  direction: "send" | "receive";
  device: string;
  timestamp: string;
  speed?: string;
  progress?: number;
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // Direct download link or base64 data URL
}

export interface DeviceConfig {
  deviceName: string;
  avatarColor: string;
  ipAddress: string;
  port: string;
}

export interface PremiumState {
  isPremium: boolean;
  nigeriaPrice: string; // "₦700/mo"
}
