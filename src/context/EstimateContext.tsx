import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatItemData {
  id: string;
  companyName: string;
  price: string;
  time: string;
  isActive: boolean;
  isUnread: boolean;
  logoUri?: any;
  rating: string;
}

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
  estimateId?: number | null;
  images?: any[];
  
  movingDate?: string | null;
  startLocation?: LocationInfo;
  endLocation?: LocationInfo;
  items?: Item[];
  boxQuantity?: number;
  truckInfo?: TruckInfo | null;
  aiSummary?: string;
  analysisResult?: any;
}

export interface ConfirmedCompany {
  name: string;
  logo: any;
  price: string;
  rating?: string;
}

export interface QuoteInfo {
  isLowest: boolean;
  price: string;
  rating: string;
  tags: string[];
  companyCount: number;
}

interface EstimateContextType {
  requestData: RequestData | null;
  setRequestData: React.Dispatch<React.SetStateAction<RequestData | null>>;
  updateAiSummary: (summary: string) => void;
  estimateStatus: 'pending' | 'active' | 'moving' | 'completed'| 'cancelled';
  setEstimateStatus: React.Dispatch<React.SetStateAction<'pending' | 'active' | 'moving' | 'completed'| 'cancelled'>>;
  confirmedCompany: ConfirmedCompany | null;
  setConfirmedCompany: React.Dispatch<React.SetStateAction<ConfirmedCompany | null>>;
  chatStartTime: string | null;
  setChatStartTime: React.Dispatch<React.SetStateAction<string | null>>;
  simulationStarted: boolean;
  setSimulationStarted: React.Dispatch<React.SetStateAction<boolean>>;
  quoteInfo: QuoteInfo;
  setQuoteInfo: React.Dispatch<React.SetStateAction<QuoteInfo>>;
  chatList: ChatItemData[];
  setChatList: React.Dispatch<React.SetStateAction<ChatItemData[]>>;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export const EstimateProvider = ({ children }: { children: ReactNode }) => {
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [estimateStatus, setEstimateStatus] = useState<'pending' | 'active' | 'moving' | 'completed'| 'cancelled'>('pending');
  const [confirmedCompany, setConfirmedCompany] = useState<ConfirmedCompany | null>(null);
  const [chatStartTime, setChatStartTime] = useState<string | null>(null);
  const [simulationStarted, setSimulationStarted] = useState<boolean>(false);
  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo>({
    isLowest: false,
    price: '-',
    rating: '-',
    tags: [],
    companyCount: 0
  });
  const [chatList, setChatList] = useState<ChatItemData[]>([
    {
      id: '2',
      companyName: '작은 짐 이사',
      price: '820,000원',
      time: '방금',
      isActive: true,
      isUnread: false, // 초기값은 false, 견적 받는 중 상태가 되면 true로 변경
      logoUri: require('../../assets/smallisa.png'),
      rating: '4.9',
    },
    {
      id: '1',
      companyName: '백마익스프레스',
      price: '860,000원',
      time: '방금',
      isActive: false,
      isUnread: false, // 초기값은 false, 견적 받는 중 상태가 되면 true로 변경
      logoUri: require('../../assets/back.png'),
      rating: '4.8',
    },
    {
      id: '3',
      companyName: '2424닷컴',
      price: '900,000원',
      time: '방금',
      isActive: false,
      isUnread: false, // 초기값은 false, 견적 받는 중 상태가 되면 true로 변경
      logoUri: require('../../assets/2424.png'),
      rating: '4.7',
    },
  ]);

  const updateAiSummary = (summary: string) => {
    setRequestData(prev => prev ? { ...prev, aiSummary: summary } : { aiSummary: summary });
  };

  return (
    <EstimateContext.Provider value={{
      requestData, 
      setRequestData, 
      updateAiSummary, 
      estimateStatus, 
      setEstimateStatus,
      confirmedCompany,
      setConfirmedCompany,
      chatStartTime,
      setChatStartTime,
      simulationStarted,
      setSimulationStarted,
      quoteInfo,
      setQuoteInfo,
      chatList,
      setChatList
    }}>
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
