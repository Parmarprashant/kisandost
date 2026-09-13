export type MemoryField = {
  _id: string;
  farmerId: string;
  name: string;
  area: number;
  areaUnit: string;
  location: any;
  soil: any;
  irrigation: any;
  previousCrop: string;
  crops?: any[];
  createdAt: string;
  updatedAt: string;
};

export type MemoryCrop = {
  _id: string;
  farmerId: string;
  fieldId: string;
  cropName: string;
  cropMasterId?: string;
  variety?: string;
  sowingDate: string;
  cultivatedArea: number;
  cultivatedAreaUnit: string;
  cultivationMethod?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

declare global {
  var memoryFieldsStore: MemoryField[] | undefined;
  var memoryCropsStore: MemoryCrop[] | undefined;
}

if (!global.memoryFieldsStore) {
  global.memoryFieldsStore = [];
}
if (!global.memoryCropsStore) {
  global.memoryCropsStore = [];
}

export const memoryFields = global.memoryFieldsStore;
export const memoryCrops = global.memoryCropsStore;
