// Web Bluetooth API type definitions
// Based on https://webbluetoothcg.github.io/web-bluetooth/

interface Navigator {
  bluetooth: Bluetooth;
}

interface Bluetooth {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
  getDevices(): Promise<BluetoothDevice[]>;
}

interface RequestDeviceOptions {
  filters?: BluetoothLEScanFilter[];
  optionalServices?: BluetoothServiceUUID[];
  acceptAllDevices?: boolean;
}

interface BluetoothLEScanFilter {
  services?: BluetoothServiceUUID[];
  name?: string;
  namePrefix?: string;
  manufacturerData?: BluetoothManufacturerDataFilter[];
  serviceData?: BluetoothServiceDataFilter[];
}

interface BluetoothManufacturerDataFilter {
  companyIdentifier: number;
  dataPrefix?: BufferSource;
  mask?: BufferSource;
}

interface BluetoothServiceDataFilter {
  service: BluetoothServiceUUID;
  dataPrefix?: BufferSource;
  mask?: BufferSource;
}

interface BluetoothDevice extends EventTarget {
  readonly id: string;
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
  readonly uuids?: string[];

  watchAdvertisements(): Promise<void>;
  unwatchAdvertisements(): void;

  addEventListener(
    type: "gattserverdisconnected",
    listener: (this: BluetoothDevice, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: "advertisementreceived",
    listener: (this: BluetoothDevice, ev: BluetoothAdvertisingEvent) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener(
    type: "gattserverdisconnected",
    listener: (this: BluetoothDevice, ev: Event) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: "advertisementreceived",
    listener: (this: BluetoothDevice, ev: BluetoothAdvertisingEvent) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface BluetoothRemoteGATTServer {
  readonly device: BluetoothDevice;
  readonly connected: boolean;

  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(
    service: BluetoothServiceUUID
  ): Promise<BluetoothRemoteGATTService>;
  getPrimaryServices(
    service?: BluetoothServiceUUID
  ): Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothRemoteGATTService extends EventTarget {
  readonly device: BluetoothDevice;
  readonly uuid: string;
  readonly isPrimary: boolean;

  getCharacteristic(
    characteristic: BluetoothCharacteristicUUID
  ): Promise<BluetoothRemoteGATTCharacteristic>;
  getCharacteristics(
    characteristic?: BluetoothCharacteristicUUID
  ): Promise<BluetoothRemoteGATTCharacteristic[]>;
  getIncludedService(
    service: BluetoothServiceUUID
  ): Promise<BluetoothRemoteGATTService>;
  getIncludedServices(
    service?: BluetoothServiceUUID
  ): Promise<BluetoothRemoteGATTService[]>;

  addEventListener(
    type: "serviceadded",
    listener: (this: BluetoothRemoteGATTService, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: "servicechanged",
    listener: (this: BluetoothRemoteGATTService, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: "serviceremoved",
    listener: (this: BluetoothRemoteGATTService, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener(
    type: "serviceadded",
    listener: (this: BluetoothRemoteGATTService, ev: Event) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: "servicechanged",
    listener: (this: BluetoothRemoteGATTService, ev: Event) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: "serviceremoved",
    listener: (this: BluetoothRemoteGATTService, ev: Event) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  readonly service: BluetoothRemoteGATTService;
  readonly uuid: string;
  readonly properties: BluetoothCharacteristicProperties;
  readonly value?: DataView;

  readValue(): Promise<DataView>;
  writeValue(value: BufferSource): Promise<void>;
  writeValueWithResponse(value: BufferSource): Promise<void>;
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  getDescriptor(
    descriptor: BluetoothDescriptorUUID
  ): Promise<BluetoothRemoteGATTDescriptor>;
  getDescriptors(
    descriptor?: BluetoothDescriptorUUID
  ): Promise<BluetoothRemoteGATTDescriptor[]>;

  addEventListener(
    type: "characteristicvaluechanged",
    listener: (this: BluetoothRemoteGATTCharacteristic, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener(
    type: "characteristicvaluechanged",
    listener: (this: BluetoothRemoteGATTCharacteristic, ev: Event) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface BluetoothCharacteristicProperties {
  readonly broadcast: boolean;
  readonly read: boolean;
  readonly writeWithoutResponse: boolean;
  readonly write: boolean;
  readonly notify: boolean;
  readonly indicate: boolean;
  readonly authenticatedSignedWrites: boolean;
  readonly reliableWrite: boolean;
  readonly writableAuxiliaries: boolean;
}

interface BluetoothRemoteGATTDescriptor {
  readonly characteristic: BluetoothRemoteGATTCharacteristic;
  readonly uuid: string;
  readonly value?: DataView;

  readValue(): Promise<DataView>;
  writeValue(value: BufferSource): Promise<void>;
}

interface BluetoothAdvertisingEvent extends Event {
  readonly device: BluetoothDevice;
  readonly uuids: string[];
  readonly name?: string;
  readonly appearance?: number;
  readonly txPower?: number;
  readonly rssi?: number;
  readonly manufacturerData: Map<number, DataView>;
  readonly serviceData: Map<string, DataView>;
}

type BluetoothServiceUUID = number | string;
type BluetoothCharacteristicUUID = number | string;
type BluetoothDescriptorUUID = number | string;
