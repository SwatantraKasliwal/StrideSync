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
  private simulatedBuzzerState: boolean = false;
  private commandQueue: Array<() => Promise<void>> = [];
  private isProcessingCommand: boolean = false;

  // Connection monitoring
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private isReconnecting: boolean = false;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private lastDataReceivedTime: number = 0;
  private connectionMonitorInterval: NodeJS.Timeout | null = null;

  // HC-05 UUIDs (try multiple variations)
  private readonly HC05_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
  private readonly HC05_DATA_CHARACTERISTIC_UUID =
    "0000ffe1-0000-1000-8000-00805f9b34fb";
  private readonly HC05_COMMAND_CHARACTERISTIC_UUID =
    "0000ffe1-0000-1000-8000-00805f9b34fb"; // HC-05 uses same for both

  // Alternative HC-05 UUIDs (some modules use these)
  private readonly HC05_ALT_SERVICE_UUID =
    "0000fff0-0000-1000-8000-00805f9b34fb";
  private readonly HC05_ALT_DATA_CHAR_UUID =
    "0000fff1-0000-1000-8000-00805f9b34fb";

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
    // Handle page refresh/close to maintain connection
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        // Don't disconnect on page refresh - let the connection persist
        console.log(
          "📄 BluetoothService: Page refresh detected - maintaining connection"
        );
      });
    }
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

      console.log("BluetoothService: Starting device scan...");

      // Try to find HC-05 devices with specific service UUID first
      let device: BluetoothDevice;

      try {
        console.log(
          "🔍 BluetoothService: Attempting to scan for HC-05 devices..."
        );
        device = await navigator.bluetooth!.requestDevice({
          filters: [
            { services: [this.HC05_SERVICE_UUID] },
            { services: [this.HC05_ALT_SERVICE_UUID] },
            { name: "HI TECH" },
            { namePrefix: "HC-" },
            { namePrefix: "BT-" },
            { namePrefix: "HI" },
          ],
          optionalServices: [
            this.HC05_SERVICE_UUID,
            this.HC05_ALT_SERVICE_UUID,
            this.FITNESS_MACHINE_SERVICE_UUID,
            this.GENERIC_ACCESS_SERVICE_UUID,
            this.BATTERY_SERVICE_UUID,
            "device_information",
            "generic_access",
            "battery_service",
            "heart_rate",
            "0000180a-0000-1000-8000-00805f9b34fb", // Device Information
            "0000180f-0000-1000-8000-00805f9b34fb", // Battery Service
            "0000fff0-0000-1000-8000-00805f9b34fb", // Alternative HC-05
            "0000ffe0-0000-1000-8000-00805f9b34fb", // Standard HC-05
          ],
        });
        console.log("✅ BluetoothService: Found HC-05 device:", device.name);
      } catch (firstError) {
        console.error(
          "❌ BluetoothService: Filtered HC-05 scan failed:",
          firstError
        );
        console.log("🔄 BluetoothService: Trying acceptAllDevices method...");

        // Fallback to accepting all devices
        device = await navigator.bluetooth!.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            this.HC05_SERVICE_UUID,
            this.HC05_ALT_SERVICE_UUID,
            this.FITNESS_MACHINE_SERVICE_UUID,
            this.GENERIC_ACCESS_SERVICE_UUID,
            this.BATTERY_SERVICE_UUID,
            "device_information",
            "generic_access",
            "battery_service",
            "heart_rate",
            "0000180a-0000-1000-8000-00805f9b34fb", // Device Information
            "0000180f-0000-1000-8000-00805f9b34fb", // Battery Service
            "0000fff0-0000-1000-8000-00805f9b34fb", // Alternative HC-05
            "0000ffe0-0000-1000-8000-00805f9b34fb", // Standard HC-05
          ],
        });
      }

      // Store the selected device for later connection
      this.device = device;

      // Generate a friendly name if none provided
      let deviceName = device.name;
      if (!deviceName || deviceName.trim() === "") {
        deviceName = this.getDeviceTypeFromId(device.id);
      }

      console.log(
        "BluetoothService: Device selected:",
        deviceName,
        "ID:",
        device.id
      );

      return [
        {
          id: device.id,
          name: deviceName,
          connected: device.gatt?.connected || false,
        },
      ];
    } catch (error) {
      console.error("BluetoothService: Error scanning for devices:", error);
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
   */
  async connectTestDevice(): Promise<void> {
    try {
      console.log("BluetoothService: connectTestDevice() called");
      console.log(
        "BluetoothService: Calling status callback with 'connecting'"
      );
      this.statusCallback?.("connecting");

      // Simulate connection delay
      console.log("BluetoothService: Simulating connection delay...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Set up test device
      this.device = null; // No real device
      this.server = null; // No real server

      // Start test simulation
      console.log("BluetoothService: Starting mobile simulation...");
      this.startMobileSimulation();

      console.log("BluetoothService: Calling status callback with 'connected'");
      this.statusCallback?.("connected");
      console.log("BluetoothService: Test device connected successfully");
    } catch (error) {
      console.error("BluetoothService: Test connection failed:", error);
      this.statusCallback?.("error");
      throw new Error("Test connection failed");
    }
  }

  /**
   * Connect to a Bluetooth device (HC-05 or mobile device)
   */
  async connect(): Promise<void> {
    try {
      console.log("BluetoothService: Starting connection process...");
      this.statusCallback?.("connecting");

      if (!this.checkBluetoothSupport()) {
        throw new Error("Bluetooth is not supported in this environment");
      }

      // Device should already be selected from scanForDevices
      if (!this.device) {
        console.error("BluetoothService: No device selected. Must scan first.");
        throw new Error("No device selected. Please scan for devices first.");
      }

      console.log("BluetoothService: Connecting to device:", this.device.name);

      // Check if device has GATT capability
      if (!this.device.gatt) {
        throw new Error(
          "Device does not support GATT operations (Classic Bluetooth device)"
        );
      }

      // Check if already connected
      if (this.device.gatt.connected) {
        console.log("Device already connected, using existing connection");
        this.server = this.device.gatt;
      } else {
        // Connect to GATT server with timeout
        console.log("Connecting to GATT server...");
        this.server = await Promise.race([
          this.device.gatt.connect(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 10000)
          ),
        ]);
      }

      // Verify server connection
      if (!this.server || !this.server.connected) {
        throw new Error("Failed to establish GATT server connection");
      }

      console.log("✅ Connected to GATT server successfully");

      // Try to get device name from Device Information Service if not available
      if (!this.device.name || this.device.name === "") {
        await this.tryToGetDeviceName();
      }

      // Try to detect device type and get appropriate service
      await this.setupDeviceServices();

      // Listen for disconnection (only if device is still valid)
      if (this.device) {
        this.device.addEventListener(
          "gattserverdisconnected",
          this.handleDisconnection.bind(this)
        );
      }

      // Start connection monitoring
      this.startConnectionMonitoring();

      this.statusCallback?.("connected");
      console.log("✅ Device connected successfully");
    } catch (error) {
      console.error("❌ Connection failed:", error);

      // Clean up on failure
      this.cleanup();

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
   * Setup services based on device type with better error handling
   */
  private async setupDeviceServices(): Promise<void> {
    console.log(
      `🔍 BluetoothService: Setting up services for device: ${this.device?.name}`
    );

    try {
      // Verify server is available
      if (!this.server) {
        throw new Error("GATT Server is null - connection failed");
      }

      if (!this.server.connected) {
        throw new Error(
          "GATT Server is disconnected - cannot retrieve services"
        );
      }

      // First, try to find HC-05 service using simplified approach
      const success = await this.trySetupHC05Service();

      if (success) {
        console.log("🎉 HC-05 setup completed successfully!");
        return;
      }

      // If HC-05 setup failed, fall back to simulation
      console.log(
        "� BluetoothService: HC-05 setup failed, starting simulation..."
      );
      this.startMobileSimulation();
    } catch (error) {
      console.error("❌ BluetoothService: Service setup failed:", error);
      console.log("🔄 BluetoothService: Falling back to simulation mode");
      this.startMobileSimulation();
    }
  }

  /**
   * Simplified HC-05 setup method
   */
  private async trySetupHC05Service(): Promise<boolean> {
    try {
      console.log("🔍 BluetoothService: Attempting HC-05 service discovery...");

      if (!this.server) {
        return false;
      }

      // Get all available services first
      const services = await this.server.getPrimaryServices();
      console.log(`🔍 BluetoothService: Found ${services.length} services`);

      // Look for HC-05 service in all available services
      let hc05Service = null;
      for (const service of services) {
        const uuid = service.uuid.toLowerCase();
        console.log(`� BluetoothService: Checking service UUID: ${uuid}`);

        if (
          uuid.includes("ffe0") ||
          uuid === this.HC05_SERVICE_UUID.toLowerCase() ||
          uuid.includes("fff0") ||
          uuid === this.HC05_ALT_SERVICE_UUID.toLowerCase()
        ) {
          console.log("✅ BluetoothService: Found HC-05 compatible service!");
          hc05Service = service;
          break;
        }
      }

      if (!hc05Service) {
        console.log("❌ BluetoothService: No HC-05 service found");
        return false;
      }

      this.service = hc05Service;

      // Get characteristics
      const characteristics = await hc05Service.getCharacteristics();
      console.log(
        `🔍 BluetoothService: Found ${characteristics.length} characteristics`
      );

      // Look for data characteristic
      let dataChar = null;
      for (const char of characteristics) {
        const uuid = char.uuid.toLowerCase();
        console.log(
          `🔍 BluetoothService: Checking characteristic UUID: ${uuid}`
        );

        if (
          uuid.includes("ffe1") ||
          uuid === this.HC05_DATA_CHARACTERISTIC_UUID.toLowerCase() ||
          uuid.includes("fff1") ||
          uuid === this.HC05_ALT_DATA_CHAR_UUID.toLowerCase()
        ) {
          console.log("✅ BluetoothService: Found HC-05 data characteristic!");
          dataChar = char;
          break;
        }
      }

      if (!dataChar) {
        console.log("❌ BluetoothService: No data characteristic found");
        return false;
      }

      this.dataCharacteristic = dataChar;
      this.commandCharacteristic = dataChar; // HC-05 uses same for both

      // Start notifications
      console.log("🔍 BluetoothService: Starting notifications...");
      await this.dataCharacteristic.startNotifications();

      // Add event listener for data
      this.dataCharacteristic.addEventListener(
        "characteristicvaluechanged",
        this.handleDataReceived.bind(this)
      );

      console.log("✅ BluetoothService: Notifications started successfully!");

      // Update last data received time
      this.lastDataReceivedTime = Date.now();

      // Send initial status command after a delay
      setTimeout(async () => {
        try {
          console.log("🧪 BluetoothService: Sending initial STATUS command...");
          await this.sendCommand("STATUS");
          console.log("✅ BluetoothService: Initial STATUS command sent!");
        } catch (error) {
          console.error(
            "❌ BluetoothService: Failed to send initial STATUS:",
            error
          );
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error("❌ BluetoothService: HC-05 setup error:", error);
      return false;
    }
  }

  /**
   * Start mobile device simulation (when connected to phones/tablets)
   */
  private startMobileSimulation(): void {
    this.isSimulating = true;
    this.simulatedBuzzerState = false; // Initialize buzzer as OFF
    let stepCount = 0;

    console.log("BluetoothService: Starting mobile device simulation...");

    this.simulationInterval = setInterval(() => {
      // Simulate realistic step data
      stepCount += Math.floor(Math.random() * 4) + 1; // 1-4 steps every 2 seconds

      // Simulate power generation based on steps
      const powerVariation = Math.random() * 0.8 + 0.2; // 0.2 to 1.0 watts
      const power = parseFloat(powerVariation.toFixed(2));

      // Use actual buzzer state from commands instead of random
      const buzzerActive = this.simulatedBuzzerState;

      const simulatedData: StrideData = {
        steps: stepCount,
        power: power,
        buzzerActive: buzzerActive,
        timestamp: Date.now(),
      };

      console.log("BluetoothService: Simulated data:", simulatedData);

      if (this.dataCallback) {
        console.log(
          "BluetoothService: Calling data callback with simulated data"
        );
        this.dataCallback(simulatedData);
      } else {
        console.log("BluetoothService: No data callback set!");
      }
    }, 2000); // Update every 2 seconds
  }

  /**
   * Start connection monitoring to detect and handle disconnections
   */
  private startConnectionMonitoring(): void {
    console.log("🔍 BluetoothService: Starting connection monitoring...");

    // Clear any existing monitoring
    this.stopConnectionMonitoring();

    // Monitor connection health every 5 seconds
    this.connectionMonitorInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastData = now - this.lastDataReceivedTime;

      // If no data received for 10 seconds, connection might be dead
      if (timeSinceLastData > 10000 && !this.isSimulating) {
        console.warn(
          "⚠️ BluetoothService: No data received for 10 seconds, checking connection..."
        );

        // Check if still connected
        if (!this.isConnected()) {
          console.error(
            "❌ BluetoothService: Connection lost, attempting reconnection..."
          );
          this.attemptReconnection();
        }
      }
    }, 5000);

    // Send keep-alive ping every 8 seconds
    this.keepAliveInterval = setInterval(async () => {
      if (this.isConnected() && !this.isSimulating) {
        try {
          console.log(
            "💓 BluetoothService: Sending keep-alive STATUS command..."
          );
          await this.sendCommand("STATUS");
        } catch (error) {
          console.error("❌ BluetoothService: Keep-alive failed:", error);
        }
      }
    }, 8000);
  }

  /**
   * Stop connection monitoring
   */
  private stopConnectionMonitoring(): void {
    if (this.connectionMonitorInterval) {
      clearInterval(this.connectionMonitorInterval);
      this.connectionMonitorInterval = null;
    }
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Attempt to reconnect to the device
   */
  private async attemptReconnection(): Promise<void> {
    if (
      this.isReconnecting ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("❌ BluetoothService: Max reconnection attempts reached");
        this.statusCallback?.("error");
      }
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(
      `🔄 BluetoothService: Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
    );

    try {
      // Wait before reconnecting
      await new Promise((resolve) => setTimeout(resolve, this.reconnectDelay));

      // Try to reconnect
      if (this.device && this.device.gatt) {
        this.statusCallback?.("connecting");
        this.server = await this.device.gatt.connect();
        await this.setupDeviceServices();

        // Reset reconnection state on success
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        this.lastDataReceivedTime = Date.now();

        this.statusCallback?.("connected");
        console.log("✅ BluetoothService: Reconnection successful!");
      }
    } catch (error) {
      console.error(
        `❌ BluetoothService: Reconnection attempt ${this.reconnectAttempts} failed:`,
        error
      );
      this.isReconnecting = false;

      // Try again if we haven't reached max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.attemptReconnection(), this.reconnectDelay);
      } else {
        this.statusCallback?.("error");
      }
    }
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
    this.simulatedBuzzerState = false; // Reset buzzer state
  }

  /**
   * Disconnect from the device
   */
  async disconnect(): Promise<void> {
    try {
      // Stop monitoring and simulation
      this.stopConnectionMonitoring();
      this.stopMobileSimulation();

      // Reset reconnection state
      this.reconnectAttempts = 0;
      this.isReconnecting = false;

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
   * Add command to queue to prevent GATT operation conflicts
   */
  private async queueCommand(commandFn: () => Promise<void>): Promise<void> {
    // Check if device is connected before queueing command
    if (!this.server || !this.server.connected) {
      console.warn(
        "⚠️ BluetoothService: Device not connected, cannot send command"
      );
      throw new Error("Device not connected. Cannot send command.");
    }

    return new Promise((resolve, reject) => {
      this.commandQueue.push(async () => {
        try {
          // Double-check connection before executing command
          if (!this.server || !this.server.connected) {
            throw new Error("Device disconnected while processing command");
          }
          await commandFn();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      this.processCommandQueue();
    });
  }

  /**
   * Process command queue sequentially
   */
  private async processCommandQueue(): Promise<void> {
    if (this.isProcessingCommand || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessingCommand = true;

    while (this.commandQueue.length > 0) {
      const commandFn = this.commandQueue.shift();
      if (commandFn) {
        try {
          await commandFn();
          // Add delay between commands to prevent GATT conflicts
          // Increased from 100ms to 300ms for better HC-05 compatibility
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error) {
          console.error("Command queue error:", error);
        }
      }
    }

    this.isProcessingCommand = false;
  }

  /**
   * Send command to device (for HC-05) or simulate command for mobile devices
   */
  async sendCommand(command: string): Promise<void> {
    if (this.isSimulating) {
      // For mobile simulation, process buzzer commands immediately
      console.log(
        `🔊 BluetoothService: Processing simulated command: ${command}`
      );

      if (command === "BUZZER_ON" || command === "ON") {
        this.simulatedBuzzerState = true;
        console.log(`🔊 BluetoothService: Simulated buzzer turned ON`);
      } else if (command === "BUZZER_OFF" || command === "OFF") {
        this.simulatedBuzzerState = false;
        console.log(`🔊 BluetoothService: Simulated buzzer turned OFF`);
      }

      console.log(
        `🔊 BluetoothService: Simulated buzzer state is now: ${this.simulatedBuzzerState}`
      );
      return;
    }

    // Validate connection before sending command
    if (!this.server || !this.server.connected) {
      const errorMsg =
        "Device not connected. Please reconnect before sending commands.";
      console.warn(
        `⚠️ BluetoothService: Cannot send command - device not connected (this may be normal during connection setup)`
      );
      throw new Error(errorMsg);
    }

    // For real devices, use command queue to prevent GATT conflicts
    return this.queueCommand(async () => {
      if (!this.commandCharacteristic) {
        throw new Error(
          "Device not connected or command characteristic not available"
        );
      }

      // Final check before writing
      if (!this.server || !this.server.connected) {
        throw new Error("Device disconnected before command could be sent");
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(command);

      // Retry logic for GATT operation conflicts
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `🔊 BluetoothService: Writing "${command}" to characteristic (attempt ${attempt}/${maxRetries})...`
          );
          await this.commandCharacteristic.writeValue(data);
          console.log(
            `✅ BluetoothService: Command "${command}" written successfully to HC-05`
          );
          return; // Success - exit retry loop
        } catch (error: any) {
          lastError = error;

          // Check if it's a GATT operation conflict
          if (
            error.message?.includes("GATT operation") ||
            error.message?.includes("already in progress")
          ) {
            console.warn(
              `⚠️ BluetoothService: GATT busy, waiting before retry ${attempt}/${maxRetries}...`
            );

            // Wait before retrying (exponential backoff)
            const waitTime = attempt * 200; // 200ms, 400ms, 600ms
            await new Promise((resolve) => setTimeout(resolve, waitTime));

            // Don't throw yet, try again
            if (attempt < maxRetries) continue;
          }

          // For other errors or max retries reached, throw immediately
          throw error;
        }
      }

      // If we get here, all retries failed
      throw new Error(
        `Failed to send command "${command}" after ${maxRetries} retries: ${lastError?.message}`
      );
    });
  }

  /**
   * Toggle buzzer on/off
   */
  async setBuzzer(enabled: boolean): Promise<void> {
    const command = enabled ? "BUZZER_ON" : "BUZZER_OFF";
    console.log(
      `🔊 BluetoothService: setBuzzer(${enabled}) -> sending command: "${command}"`
    );
    await this.sendCommand(command);
    console.log(`✅ BluetoothService: Command "${command}" sent successfully`);
  }

  /**
   * Handle incoming data from the device
   */
  private handleDataReceived(event: Event): void {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;

    if (!value) {
      console.log("📥 BluetoothService: Received empty value");
      return;
    }

    try {
      // Decode the data
      const decoder = new TextDecoder();
      const dataString = decoder.decode(value).trim();

      console.log("📥 BluetoothService: Raw data received:", `"${dataString}"`);

      // Update last data received time for connection monitoring
      this.lastDataReceivedTime = Date.now();

      // Skip empty messages
      if (!dataString) {
        console.log("📝 BluetoothService: Skipping empty message");
        return;
      }

      // Skip command acknowledgments and system messages (but be more specific)
      if (
        dataString.startsWith("RECEIVED:") ||
        dataString.startsWith("TEST SUCCESS") ||
        dataString.startsWith("BUZZER ON SUCCESS") ||
        dataString.startsWith("BUZZER OFF SUCCESS") ||
        dataString.startsWith("RESET SUCCESS") ||
        dataString.startsWith("ERROR:") ||
        dataString.startsWith("STATUS:") ||
        dataString.includes("HI TECH READY") ||
        dataString.includes("===")
      ) {
        console.log(
          "📝 BluetoothService: Skipping system message:",
          dataString
        );
        return;
      }

      // Look for structured data (STEPS:1234,POWER:0.52,BUZZER:1)
      if (dataString.includes("STEPS:") || dataString.includes("POWER:")) {
        console.log("🎯 BluetoothService: Found structured data:", dataString);
        const data = this.parseIncomingData(dataString);
        if (data && this.dataCallback) {
          console.log(
            "✅ BluetoothService: Successfully parsed and calling callback:",
            data
          );
          this.dataCallback(data);
        } else {
          console.log("❌ BluetoothService: Failed to parse structured data");
        }
        return;
      }

      // Try to parse "Live Data" format as fallback
      if (dataString.includes("Live Data")) {
        console.log(
          "🎯 BluetoothService: Found Live Data message:",
          dataString
        );
        const data = this.parseLiveDataMessage(dataString);
        if (data && this.dataCallback) {
          console.log("✅ BluetoothService: Parsed live data:", data);
          this.dataCallback(data);
        }
        return;
      }

      // Log unhandled messages for debugging (but don't spam)
      if (!dataString.includes("Steps:") && !dataString.includes("Power:")) {
        console.log("📝 BluetoothService: Unhandled message:", dataString);
      }
    } catch (error) {
      console.error("❌ BluetoothService: Error parsing received data:", error);
    }
  }

  /**
   * Parse incoming data string from Arduino
   */
  private parseIncomingData(dataString: string): StrideData | null {
    try {
      console.log(`📥 BluetoothService: Parsing data string: "${dataString}"`);

      // Clean the data string - remove any non-printable characters
      const cleanedString = dataString.replace(/[^\x20-\x7E]/g, "").trim();
      console.log(
        `🧹 BluetoothService: Cleaned data string: "${cleanedString}"`
      );

      // Expected format: "STEPS:1234,POWER:0.52,BUZZER:1"
      const parts = cleanedString.split(",");
      const data: Partial<StrideData> = {};

      for (const part of parts) {
        const colonIndex = part.indexOf(":");
        if (colonIndex === -1) continue;

        const key = part.substring(0, colonIndex).trim().toUpperCase();
        const value = part.substring(colonIndex + 1).trim();

        console.log(`📝 BluetoothService: Parsing part: "${key}" = "${value}"`);

        switch (key) {
          case "STEPS":
            const steps = parseInt(value);
            if (!isNaN(steps)) data.steps = steps;
            break;
          case "POWER":
            const power = parseFloat(value);
            if (!isNaN(power)) data.power = power;
            break;
          case "BUZZER":
            data.buzzerActive = value === "1" || value.toLowerCase() === "true";
            console.log(
              `🔊 BluetoothService: Parsed buzzer state: ${value} -> ${data.buzzerActive}`
            );
            break;
        }
      }

      // Validate that we have the required data
      if (typeof data.steps === "number" && typeof data.power === "number") {
        const result = {
          steps: data.steps,
          power: data.power,
          buzzerActive: data.buzzerActive || false,
          timestamp: Date.now(),
        };
        console.log(`✅ BluetoothService: Parsed complete data:`, result);
        return result;
      } else {
        console.log(
          `❌ BluetoothService: Missing required data - steps: ${data.steps}, power: ${data.power}`
        );
      }

      return null;
    } catch (error) {
      console.error("Error parsing data string:", error);
      return null;
    }
  }

  /**
   * Parse "Live Data" message format from Arduino
   */
  private parseLiveDataMessage(dataString: string): StrideData | null {
    try {
      console.log(`📥 BluetoothService: Parsing live data: "${dataString}"`);

      // Expected format: "Live Data - Steps:1234 Power:0.52mV Buzzer:ON"
      const stepMatch = dataString.match(/Steps:(\d+)/);
      const powerMatch = dataString.match(/Power:([\d.]+)/);
      const buzzerMatch = dataString.match(/Buzzer:(ON|OFF)/);

      if (stepMatch && powerMatch) {
        const result = {
          steps: parseInt(stepMatch[1]) || 0,
          power: parseFloat(powerMatch[1]) || 0,
          buzzerActive: buzzerMatch ? buzzerMatch[1] === "ON" : false,
          timestamp: Date.now(),
        };
        console.log(`✅ BluetoothService: Parsed live data:`, result);
        return result;
      }

      return null;
    } catch (error) {
      console.error("Error parsing live data message:", error);
      return null;
    }
  }

  /**
   * Handle device disconnection
   */
  private handleDisconnection(): void {
    console.log("⚠️ BluetoothService: Device disconnected event triggered");
    this.stopConnectionMonitoring();
    this.stopMobileSimulation();

    // Don't immediately notify disconnection, try to reconnect first
    if (!this.isReconnecting) {
      console.log("🔄 BluetoothService: Attempting automatic reconnection...");
      this.attemptReconnection();
    }
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    this.stopConnectionMonitoring();
    this.stopMobileSimulation();
    this.commandQueue = []; // Clear command queue
    this.isProcessingCommand = false;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
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
   * Try to recover existing connection (for page refresh)
   */
  async tryRecoverConnection(): Promise<boolean> {
    try {
      if (this.device && this.device.gatt) {
        console.log("🔄 BluetoothService: Attempting connection recovery...");
        if (this.device.gatt.connected) {
          console.log(
            "✅ BluetoothService: Device still connected after refresh"
          );
          this.server = this.device.gatt;
          await this.setupDeviceServices();
          this.statusCallback?.("connected");
          return true;
        }
      }
      return false;
    } catch (error) {
      console.log("❌ BluetoothService: Connection recovery failed:", error);
      return false;
    }
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
