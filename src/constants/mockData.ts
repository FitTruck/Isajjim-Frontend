import { RequestData } from "../context/EstimateContext";

export const MOCK_REQUEST_DATA: RequestData = {
  estimateId: 999,
  movingDate: "2026. 03. 15 (금)",
  startLocation: {
    address: "서울시 강남구 역삼동 123-45",
    detailAddress: "OO아파트 101동 1202호",
    floor: "12",
    elevator: true,
    buildingType: "아파트",
    roomSize: "30평대",
    ladderTruck: "가능",
    roomType: "거실",
    duplex: false,
    groundStair: false,
    parking: true
  },
  endLocation: {
    address: "경기도 용인시 수지구 풍덕천동 987-65",
    detailAddress: "XX오피스텔 304호",
    floor: "3",
    elevator: true,
    buildingType: "오피스텔",
    roomSize: "20평대",
    ladderTruck: "가능",
    roomType: "원룸",
    duplex: false,
    groundStair: false,
    parking: true
  },
  items: [
    { name: "침대 (퀸사이즈)", quantity: 1 },
    { name: "소파 (3인용)", quantity: 1 },
    { name: "양문형 냉장고", quantity: 1 },
    { name: "세탁기 (드럼)", quantity: 1 },
    { name: "책상", quantity: 2 },
    { name: "의자", quantity: 4 },
  ],
  truckInfo: {
    type: "5톤 트럭",
    quantity: 1
  },
  aiSummary: undefined
};
