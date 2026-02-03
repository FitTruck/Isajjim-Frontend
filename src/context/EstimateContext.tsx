import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LocationInfo {
  address: string | null;
  detailAddress: string | null;
  buildingType: string | null;
  roomSize: string | null;
  floor: string | null;
  elevator: boolean | null;
  ladderTruck: string | null;
  roomType: string | null;
  duplex: boolean | null;
  groundStair: boolean | null;
  parking: boolean | null;
}

export interface Item {
  name: string;
  quantity: number;
  category?: string;
  itemType?: string;
}

export interface TruckInfo {
  type: string;
  quantity: number;
}

export interface RequestData {
  estimateId: number;
  movingDate: string | null;
  startLocation: LocationInfo;
  endLocation: LocationInfo;
  items: Item[];
  truckInfo: TruckInfo | null;
  aiSummary?: string;
  images?: any[];
  analysisResult?: any;
}

interface EstimateContextType {
  requestData: RequestData | null;
  setRequestData: (data: RequestData) => void;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export const EstimateProvider = ({ children }: { children: ReactNode }) => {
  const [requestData, setRequestData] = useState<RequestData | null>(null);

  return (
    <EstimateContext.Provider value={{ requestData, setRequestData }}>
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
