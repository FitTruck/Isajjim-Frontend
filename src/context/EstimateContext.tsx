import React, { createContext, useContext, useState, ReactNode } from 'react';

// 견적 및 요청사항 관련 공통 인터페이스
export interface LocationInfo {
  address: string | null;
  detailAddress: string | null;
  floor: string | null;
  elevator: boolean | null;
  buildingType?: string | null;
  roomSize?: string | null;
  ladderTruck?: string | null;
  roomType?: string | null;
  duplex?: boolean | null;
  groundStair?: boolean | null;
  parking?: boolean | null;
  [key: string]: any;
}

export interface ItemInfo {
  name: string;
  quantity: number;
}

export interface TruckInfo {
  type: string;
  quantity: number;
}

export interface RequestData {
  estimateId?: number;
  movingDate: string | null;
  startLocation: LocationInfo;
  endLocation: LocationInfo;
  items: ItemInfo[];
  truckInfo: TruckInfo | null;
  aiSummary?: string;
}

interface EstimateContextType {
  requestData: RequestData | null;
  setRequestData: (data: RequestData) => void;
  updateAiSummary: (summary: string) => void;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export const EstimateProvider = ({ children }: { children: ReactNode }) => {
  const [requestData, setRequestDataState] = useState<RequestData | null>(null);

  const setRequestData = (data: RequestData) => {
    setRequestDataState(data);
  };

  const updateAiSummary = (summary: string) => {
    setRequestDataState(prev => prev ? { ...prev, aiSummary: summary } : null);
  };

  return (
    <EstimateContext.Provider value={{ requestData, setRequestData, updateAiSummary }}>
      {children}
    </EstimateContext.Provider>
  );
};

export const useEstimate = () => {
  const context = useContext(EstimateContext);
  if (!context) {
    throw new Error('useEstimate must be used within an EstimateProvider');
  }
  return context;
};
