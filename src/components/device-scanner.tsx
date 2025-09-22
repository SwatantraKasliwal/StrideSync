"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bluetooth,
  BluetoothSearching,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import {
  bluetoothService,
  type BluetoothDeviceInfo,
} from "@/lib/bluetooth-service";
import { useToast } from "@/hooks/use-toast";

interface DeviceScannerProps {
  onDeviceSelected: (device: BluetoothDeviceInfo) => void;
  disabled?: boolean;
}

export default function DeviceScanner({
  onDeviceSelected,
  disabled,
}: DeviceScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDeviceInfo[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    setIsScanning(true);
    setScanError(null);
    setDevices([]);

    try {
      const foundDevices = await bluetoothService.scanForDevices();
      setDevices(foundDevices);

      if (foundDevices.length === 0) {
        setScanError(
          "No Bluetooth devices found. Make sure Bluetooth is enabled and your device is discoverable."
        );
      } else {
        toast({
          title: "Device Found!",
          description: `Found: ${foundDevices[0].name}`,
        });
      }
    } catch (error) {
      let errorMessage = "Failed to scan for devices";

      if (error instanceof Error) {
        if (error.message.includes("cancelled")) {
          errorMessage =
            "Device selection was cancelled. Please try again and select a device from the list.";
        } else if (error.message.includes("not supported")) {
          errorMessage =
            "Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.";
        } else {
          errorMessage = error.message;
        }
      }

      setScanError(errorMessage);
      toast({
        title: "Scan Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeviceSelect = (device: BluetoothDeviceInfo) => {
    onDeviceSelected(device);
    setIsOpen(false);
    setDevices([]);
    setScanError(null);
  };

  const handleTestMode = () => {
    // Create a fake device for testing
    const testDevice: BluetoothDeviceInfo = {
      id: "test-device-12345",
      name: "Test StrideSync Device",
      connected: false,
    };

    onDeviceSelected(testDevice);
    setIsOpen(false);
    setDevices([]);
    setScanError(null);

    toast({
      title: "Test Mode",
      description: "Connected to simulated StrideSync device for testing",
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setDevices([]);
      setScanError(null);
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled} size="sm" className="w-full sm:w-auto">
          <BluetoothSearching className="mr-2 h-4 w-4" />
          Scan Devices
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            Connect Bluetooth Device
          </DialogTitle>
          <DialogDescription>
            Scan for nearby Bluetooth devices. Works with StrideSync HC-05
            modules and mobile devices for testing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleScan}
              disabled={isScanning}
              variant={devices.length > 0 ? "outline" : "default"}
              className="flex-1"
            >
              {isScanning ? (
                <>
                  <BluetoothSearching className="mr-2 h-4 w-4 animate-pulse" />
                  Scanning...
                </>
              ) : (
                <>
                  <BluetoothSearching className="mr-2 h-4 w-4" />
                  {devices.length > 0 ? "Scan Again" : "Scan Devices"}
                </>
              )}
            </Button>

            <Button
              onClick={handleTestMode}
              variant="secondary"
              className="flex-shrink-0"
              title="Test with simulated device"
            >
              Test Mode
            </Button>
          </div>

          {/* Scanning Progress */}
          {isScanning && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <BluetoothSearching className="h-8 w-8 animate-pulse mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Searching for Bluetooth devices...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {scanError && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Scan Failed
                  </p>
                  <p className="text-sm text-muted-foreground">{scanError}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    <p>
                      <strong>Tip:</strong> If devices show as "Unknown", this
                      is normal for privacy reasons. They will still work for
                      testing!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Device List */}
          {devices.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Available Devices</h4>
              {devices.map((device) => (
                <Card
                  key={device.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleDeviceSelect(device)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Smartphone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">
                            {device.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Device ID: {device.id.slice(0, 8)}...
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={device.connected ? "default" : "secondary"}
                        >
                          {device.connected ? "Connected" : "Available"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {/* Help Text */}
          {!isScanning && devices.length === 0 && !scanError && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Bluetooth className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click "Start Scan" to search for Bluetooth devices
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <strong>For HC-05 modules:</strong>
                    </p>
                    <p>• Power on your StrideSync device</p>
                    <p>• Ensure it's in pairing mode</p>
                    <p>
                      <strong>For mobile testing:</strong>
                    </p>
                    <p>• Any Bluetooth device will work</p>
                    <p>• App will simulate sensor data</p>
                    <p>• Devices may show as "Unknown" (normal)</p>
                    <p>
                      <strong>Easy testing:</strong> Use "Test Mode" button!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
