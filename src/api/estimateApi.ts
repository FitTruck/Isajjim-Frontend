import api from './axiosInstance';

export interface FurnitureItem {
  furnitureId: number;
  label: string;
  type: string;
  quantity: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  depth: number;
}

export interface EstimateImage {
  imageId: number;
  imageUrl: string;
  furnitureList: FurnitureItem[];
}

export interface EstimateTruckItem {
  category: string;
  itemType: string;
  quantity: number;
}

export interface EstimateLocation {
  address: string;
  detailAddress: string;
  buildingType: string;
  roomSize: string;
  floor: string;
  elevator: boolean;
  ladderTruck: string;
  roomType: string;
  duplex: boolean;
  groundStair: boolean;
  parking: boolean;
}

export type AiStatus = 'PENDING' | 'ACTIVE' | 'MOVING' | 'COMPLETED' | 'CANCELLED';

export interface EstimateData {
  estimateId: number;
  aiStatus: AiStatus;
  createdDate?: string;
  startLocation?: EstimateLocation;
  endLocation?: EstimateLocation;
  preferredMovingDate?: string;
  images: EstimateImage[];
  items: EstimateTruckItem[];
}

export const getEstimates = async (): Promise<EstimateData[]> => {
  const res = await api.get('/api/v1/estimates');
  return res.data?.data?.items ?? [];
};

export function mapAiStatus(aiStatus: AiStatus): 'pending' | 'active' | 'moving' | 'completed' | 'cancelled' {
  const map: Record<AiStatus, 'pending' | 'active' | 'moving' | 'completed' | 'cancelled'> = {
    PENDING: 'pending',
    ACTIVE: 'active',
    MOVING: 'moving',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  return map[aiStatus] ?? 'pending';
}

export function aiStatusToTimelineStep(aiStatus: AiStatus): number {
  const map: Record<AiStatus, number> = {
    PENDING: 2,
    ACTIVE: 3,
    MOVING: 4,
    COMPLETED: 5,
    CANCELLED: 2,
  };
  return map[aiStatus] ?? 2;
}

export function formatTruckType(itemType: string): string {
  const map: Record<string, string> = {
    TRUCK_1_TON: '1톤 트럭',
    TRUCK_2_5_TON: '2.5톤 트럭',
    TRUCK_5_TON: '5톤 트럭',
  };
  return map[itemType] ?? itemType;
}

export function calcFurnitureCount(images: EstimateImage[]): number {
  return images.reduce(
    (total, img) => total + img.furnitureList.reduce((s, f) => s + f.quantity, 0),
    0,
  );
}
