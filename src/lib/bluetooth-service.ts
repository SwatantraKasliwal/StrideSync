/**
 * Bluetooth Service for StrideSync Smart Shoe
 * Handles connection to HC-05 Bluetooth module and data communication
 */

export interface StrideData {
  steps: number;
  power: number;
  buzzerActive: boolean;
  timestamp: number;
}

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface IBluetoothService {
  scanForDevices(): Promise<BluetoothDeviceInfo[]>;
  connect(): Promise<void>;
  connectTestDevice(): Promise<void>;
  disconnect(): Promise<void>;
  sendCommand(command: string): Promise<void>;
  setBuzzer(enabled: boolean): Promise<void>;
  setStatusCallback(callback: (status: ConnectionStatus) => void): void;
  setDataCallback(callback: (data: StrideData) => void): void;
  isConnected(): boolean;
  getDeviceInfo(): BluetoothDeviceInfo | null;
}

export class StrideBluetoothService implements IBluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private service: BluetoothRemoteGATTService | null = null;
  private dataCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private commandCharacteristic: BluetoothRemoteGATTCharacteristic | null =
    null;
  private statusCallback: ((status: ConnectionStatus) => void) | null = null;
  private dataCallback: ((data: StrideData) => void) | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;
  private isSimulating: boolean = false;

  // Standard UUIDs for HC-05 module
  private readonly HC05_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
  private readonly HC05_DATA_CHARACTERISTIC_UUID =
    "0000ffe1-0000-1000-8000-00805f9b34fb";
  private readonly HC05_COMMAND_CHARACTERISTIC_UUID =
    "0000ffe2-0000-1000-8000-00805f9b34fb";

  // Standard Fitness Machine Service UUIDs (for fitness trackers)
  private readonly FITNESS_MACHINE_SERVICE_UUID =
    "00001826-0000-1000-8000-00805f9b34fb";
  private readonly STEP_COUNTER_CHARACTERISTIC_UUID =
    "00002a37-0000-1000-8000-00805f9b34fb";

  // Generic Access Service UUIDs (available on most Bluetooth devices)
  private readonly GENERIC_ACCESS_SERVICE_UUID =
    "00001800-0000-1000-8000-00805f9b34fb";

  // Battery Service UUIDs (common on mobile devices)
  private readonly BATTERY_SERVICE_UUID =
    "0000180f-0000-1000-8000-00805f9b34fb";

  constructor() {
    // Don't check Bluetooth support during SSR - only when actually used
  }

  /**
   * Check if Web Bluetooth is supported (only in browser)
   */
  private checkBluetoothSupport(): boolean {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      // SSR or Node.js environment
      return false;
    }

    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API is not supported in this browser");
      return false;
    }
    return true;
  }

  /**
   * Set callback for connection status changes
   */
  setStatusCallback(callback: (status: ConnectionStatus) => void): void {
    this.statusCallback = callback;
  }

  /**
   * Set callback for receiving data from the device
   */
  setDataCallback(callback: (data: StrideData) => void): void {
    this.dataCallback = callback;
  }

  /**
   * Scan for available Bluetooth devices (HC-05 modules and mobile devices)
   */
  async scanForDevices(): Promise<BluetoothDeviceInfo[]> {
    try {
      if (!this.checkBluetoothSupport()) {
        throw new Error("Bluetooth is not supported in this environment");
      }

      // Simple approach: Just use acceptAllDevices to find ANY Bluetooth device
      const device = await navigator.bluetooth!.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          this.HC05_SERVICE_UUID,
          this.FITNESS_MACHINE_SERVICE_UUID,
          this.GENERIC_ACCESS_SERVICE_UUID,
          this.BATTERY_SERVICE_UUID,
          "device_information",
          "generic_access",
          "battery_service",
          "heart_rate",
          "0000180a-0000-1000-8000-00805f9b34fb", // Device Information
          "0000180f-0000-1000-8000-00805f9b34fb", // Battery Service
        ],
      });

      // Generate a friendly name if none provided
      let deviceName = device.name;
      if (!deviceName || deviceName.trim() === "") {
        deviceName = this.getDeviceTypeFromId(device.id);
      }

      return [
        {
          id: device.id,
          name: deviceName,
          connected: device.gatt?.connected || false,
        },
      ];
    } catch (error) {
      console.error("Error scanning for devices:", error);
      if (error instanceof Error && error.message.includes("User cancelled")) {
        throw new Error(
          "Device selection was cancelled. Please try again and select a device."
        );
      }
      throw new Error(
        "Failed to scan for devices. Make sure Bluetooth is enabled and try again."
      );
    }
  }

  /**
   * Generate a friendly device name from device ID or other properties
   */
  private getDeviceTypeFromId(deviceId: string): string {
    // Create a more friendly name based on device ID patterns
    const shortId = deviceId.slice(-4).toUpperCase();
    const deviceTypes = [
      "📱 Smart Phone",
      "🎧 Bluetooth Headphones",
      "⌚ Smart Watch",
      "💻 Laptop Device",
      "📱 Tablet Device",
      "🔊 Bluetooth Speaker",
      "🏃 Fitness Tracker",
      "📡 HC-05 Module",
      "🤖 Arduino Device",
      "📟 BLE Device",
    ];

    // Use a simple hash of the device ID to consistently assign a device type
    const hash = deviceId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const typeIndex = Math.abs(hash) % deviceTypes.length;
    return `${deviceTypes[typeIndex]} (${shortId})`;
  }

  /**
   * Connect to a test device (for testing without real Bluetooth)
  /**
   * Connect to a test device (for testing without real Bluetooth)
   */
  async connectTestDevice(): Promise<void> {
    try {
      this.statusCallback?.("connecting");

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Set up test device
      this.device = null; // No real device
      this.server = null; // No real server

      // Start test simulation
      this.startMobileSimulation();

      this.statusCallback?.("connected");
      console.log("Test device connected successfully");
    } catch (error) {
      console.error("Test connection failed:", error);
      this.statusCallback?.("error");
      throw new Error("Test connection failed");
    }
  }

  /**
   * Connect to a Bluetooth device (HC-05 or mobile device)
   */
  async connect(): Promise<void> {
    try {
      this.statusCallback?.("connecting");

      if (!this.checkBluetoothSupport()) {
        throw new Error("Bluetooth is not supported in this environment");
      }

      // Request device if not already selected
      if (!this.device) {
        // Simple approach: Just scan for any device
        this.device = await navigator.bluetooth!.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            this.HC05_SERVICE_UUID,
            this.FITNESS_MACHINE_SERVICE_UUID,
            this.GENERIC_ACCESS_SERVICE_UUID,
            this.BATTERY_SERVICE_UUID,
            "device_information",
            "generic_access",
            "battery_service",
            "heart_rate",
          ],
        });
      }

      // Connect to GATT server
      this.server = await this.device.gatt!.connect();
      console.log("Connected to GATT server");

      // Try to get device name from Device Information Service if not available
      if (!this.device.name || this.device.name === "") {
        await this.tryToGetDeviceName();
      }

      // Try to detect device type and get appropriate service
      await this.setupDeviceServices();

      // Listen for disconnection
      this.device.addEventListener(
        "gattserverdisconnected",
        this.handleDisconnection.bind(this)
      );

      this.statusCallback?.("connected");
      console.log("Device connected successfully");
    } catch (error) {
      console.error("Connection failed:", error);
      this.statusCallback?.("error");
      throw new Error(
        `Connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Try to get device name from Device Information Service
   */
  private async tryToGetDeviceName(): Promise<void> {
    try {
      if (!this.server) return;

      // Try to get Device Information Service
      const deviceInfoService = await this.server.getPrimaryService(
        "device_information"
      );

      // Try to get device name characteristic
      try {
        const deviceNameChar = await deviceInfoService.getCharacteristic(
          "device_name"
        );
        const nameValue = await deviceNameChar.readValue();
        const decoder = new TextDecoder();
        const deviceName = decoder.decode(nameValue);

        if (deviceName && deviceName.trim() !== "") {
          // Update the device name (this is a bit hacky but works)
          (this.device as any)._name = deviceName.trim();
          console.log("Retrieved device name:", deviceName.trim());
        }
      } catch (nameError) {
        console.log("Could not read device name characteristic");
      }

      // Try to get manufacturer name
      try {
        const manufacturerChar = await deviceInfoService.getCharacteristic(
          "manufacturer_name_string"
        );
        const manufacturerValue = await manufacturerChar.readValue();
        const decoder = new TextDecoder();
        const manufacturer = decoder.decode(manufacturerValue);

        if (
          manufacturer &&
          manufacturer.trim() !== "" &&
          this.device &&
          (!this.device.name || this.device.name === "")
        ) {
          (this.device as any)._name = `${manufacturer.trim()} Device`;
          console.log("Using manufacturer name:", manufacturer.trim());
        }
      } catch (manufacturerError) {
        console.log("Could not read manufacturer name characteristic");
      }
    } catch (deviceInfoError) {
      console.log("Device Information Service not available");
    }
  }

  /**
   * Setup services based on device type
   */
  private async setupDeviceServices(): Promise<void> {
    try {
      // Try HC-05 service first
      try {
        this.service = await this.server!.getPrimaryService(
          this.HC05_SERVICE_UUID
        );
        this.dataCharacteristic = await this.service.getCharacteristic(
          this.HC05_DATA_CHARACTERISTIC_UUID
        );
        this.commandCharacteristic = await this.service.getCharacteristic(
          this.HC05_COMMAND_CHARACTERISTIC_UUID
        );

        // Start listening for data from HC-05
        await this.dataCharacteristic.startNotifications();
        this.dataCharacteristic.addEventListener(
          "characteristicvaluechanged",
          this.handleDataReceived.bind(this)
        );

        console.log("HC-05 device detected and configured");
        return;
      } catch (e) {
        console.log("Not an HC-05 device, trying mobile device simulation...");
      }

      // If not HC-05, try to get basic services and start mobile simulation
      try {
        // Try to get generic access or battery service to confirm connection
        await this.server!.getPrimaryService(this.GENERIC_ACCESS_SERVICE_UUID);
        console.log("Generic Bluetooth device detected");
      } catch (e) {
        try {
          await this.server!.getPrimaryService(this.BATTERY_SERVICE_UUID);
          console.log("Mobile device with battery service detected");
        } catch (e2) {
          console.log("Unknown device type, will simulate data");
        }
      }

      // Start mobile device simulation
      this.startMobileSimulation();
    } catch (error) {
      console.error("Failed to setup device services:", error);
      // Even if service setup fails, start simulation
      this.startMobileSimulation();
    }
  }

  /**
   * Start mobile device simulation (when connected to phones/tablets)
   */
  private startMobileSimulation(): void {
    this.isSimulating = true;
    let stepCount = 0;

    console.log("Starting mobile device simulation...");

    this.simulationInterval = setInterval(() => {
      // Simulate realistic step data
      stepCount += Math.floor(Math.random() * 4) + 1; // 1-4 steps every 2 seconds

      // Simulate power generation based on steps
      const powerVariation = Math.random() * 0.8 + 0.2; // 0.2 to 1.0 watts
      const power = parseFloat(powerVariation.toFixed(2));

      // Simulate object detection occasionally
      const buzzerActive = Math.random() > 0.85; // 15% chance of object detection

      const simulatedData: StrideData = {
        steps: stepCount,
        power: power,
        buzzerActive: buzzerActive,
        timestamp: Date.now(),
      };

      if (this.dataCallback) {
        this.dataCallback(simulatedData);
      }
    }, 2000); // Update every 2 seconds
  }

  /**
   * Stop mobile simulation
   */
  private stopMobileSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
  }

  /**
   * Disconnect from the device
   */
  async disconnect(): Promise<void> {
    try {
      // Stop mobile simulation if running
      this.stopMobileSimulation();

      if (this.dataCharacteristic) {
        await this.dataCharacteristic.stopNotifications();
        this.dataCharacteristic.removeEventListener(
          "characteristicvaluechanged",
          this.handleDataReceived.bind(this)
        );
      }

      if (this.server) {
        this.server.disconnect();
      }

      this.cleanup();
      this.statusCallback?.("disconnected");
      console.log("Disconnected from device");
    } catch (error) {
      console.error("Disconnection error:", error);
      this.cleanup();
      this.statusCallback?.("disconnected");
    }
  }

  /**
   * Send command to device (for HC-05) or simulate command for mobile devices
   */
  async sendCommand(command: string): Promise<void> {
    try {
      if (this.isSimulating) {
        // For mobile simulation, just log the command
        console.log(`Simulated command sent: ${command}`);
        return;
      }

      if (!this.commandCharacteristic) {
        throw new Error(
          "Device not connected or command characteristic not available"
        );
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(command);

      await this.commandCharacteristic.writeValue(data);
      console.log(`Command sent: ${command}`);
    } catch (error) {
      console.error("Failed to send command:", error);
      if (!this.isSimulating) {
        throw new Error(
          `Failed to send command: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  }

  /**
   * Toggle buzzer on/off
   */
  async setBuzzer(enabled: boolean): Promise<void> {
    const command = enabled ? "BUZZER_ON" : "BUZZER_OFF";
    await this.sendCommand(command);
  }

  /**
   * Handle incoming data from the device
   */
  private handleDataReceived(event: Event): void {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;

    if (!value) return;

    try {
      // Decode the data
      const decoder = new TextDecoder();
      const dataString = decoder.decode(value);

      // Parse data format: "STEPS:1234,POWER:0.52,BUZZER:1"
      const data = this.parseIncomingData(dataString);

      if (data && this.dataCallback) {
        this.dataCallback(data);
      }
    } catch (error) {
      console.error("Error parsing received data:", error);
    }
  }

  /**
   * Parse incoming data string from Arduino
   */
  private parseIncomingData(dataString: string): StrideData | null {
    try {
      // Expected format: "STEPS:1234,POWER:0.52,BUZZER:1"
      const parts = dataString.trim().split(",");
      const data: Partial<StrideData> = {};

      for (const part of parts) {
        const [key, value] = part.split(":");
        switch (key?.toUpperCase()) {
          case "STEPS":
            data.steps = parseInt(value) || 0;
            break;
          case "POWER":
            data.power = parseFloat(value) || 0;
            break;
          case "BUZZER":
            data.buzzerActive = value === "1" || value.toLowerCase() === "true";
            break;
        }
      }

      // Validate that we have the required data
      if (typeof data.steps === "number" && typeof data.power === "number") {
        return {
          steps: data.steps,
          power: data.power,
          buzzerActive: data.buzzerActive || false,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error("Error parsing data string:", error);
      return null;
    }
  }

  /**
   * Handle device disconnection
   */
  private handleDisconnection(): void {
    console.log("Device disconnected");
    this.stopMobileSimulation();
    this.cleanup();
    this.statusCallback?.("disconnected");
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    this.stopMobileSimulation();
    this.device = null;
    this.server = null;
    this.service = null;
    this.dataCharacteristic = null;
    this.commandCharacteristic = null;
  }

  /**
   * Check if device is currently connected
   */
  isConnected(): boolean {
    return this.server?.connected || false || this.isSimulating;
  }

  /**
   * Get connected device info
   */
  getDeviceInfo(): BluetoothDeviceInfo | null {
    if (!this.device && !this.isSimulating) return null;

    if (this.isSimulating && !this.device) {
      return {
        id: "test-simulation",
        name: "Test StrideSync Device",
        connected: true,
      };
    }

    let deviceName = this.device?.name || "";

    // If no name, try to generate a friendly one
    if (!deviceName || deviceName.trim() === "") {
      deviceName = this.getDeviceTypeFromId(this.device?.id || "unknown");
    }

    return {
      id: this.device?.id || "unknown",
      name: deviceName,
      connected: this.isConnected(),
    };
  }
}

// Create singleton instance only in browser environment
let bluetoothServiceInstance: StrideBluetoothService | null = null;

export const bluetoothService: IBluetoothService = (() => {
  if (typeof window === "undefined") {
    // Return a mock service for SSR
    return {
      scanForDevices: async () => [],
      connect: async () => {},
      connectTestDevice: async () => {},
      disconnect: async () => {},
      sendCommand: async () => {},
      setBuzzer: async () => {},
      setStatusCallback: () => {},
      setDataCallback: () => {},
      isConnected: () => false,
      getDeviceInfo: () => null,
    } as IBluetoothService;
  }

  if (!bluetoothServiceInstance) {
    bluetoothServiceInstance = new StrideBluetoothService();
  }

  return bluetoothServiceInstance;
})();
