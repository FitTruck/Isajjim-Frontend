/**
 * 시뮬레이션 관련 타입 정의
 */

export interface SimulationFurniture {
  furnitureId: number;
  label: string;
  type: string;
  quantity: number;
  width: number;      // mm
  depth: number;      // mm
  height: number;     // mm
  volume: number;     // m³
  ply_url?: string;   // GCS PLY URL
}

export type TruckType = '1ton' | '2.5ton' | '5ton';

export interface Space3DProps {
  furniture?: SimulationFurniture[];
  truckType?: TruckType;
  autoPlay?: boolean;
  onAnimationComplete?: () => void;
}

// 트럭 치수 (m 단위)
export interface TruckDimensions {
  width: number;
  depth: number;
  height: number;
}

export const TRUCK_DIMENSIONS: Record<TruckType, TruckDimensions> = {
  '1ton': { width: 1.7, depth: 2.8, height: 1.7 },
  '2.5ton': { width: 2.0, depth: 4.3, height: 1.9 },
  '5ton': { width: 2.3, depth: 6.2, height: 2.4 },
};
