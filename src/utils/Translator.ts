export const furnitureTranslations: { [key: string]: string } = {
  "AIR_CONDITIONER": "에어컨",
  "COFFEE_TABLE": "커피테이블",
  "MICROWAVE": "전자레인지",
  "OVEN": "오븐",
  "MIRROR": "거울",
  "STORAGE_BOX": "박스/수납함",
  "BENCH": "벤치",
  "TOILET": "변기",
  "SINK": "싱크대",
  "BATHTUB": "욕조",
  "BICYCLE": "자전거",
  "LADDER": "사다리",
  "FAN": "선풍기",
  "BOX": "박스",
  "CABINET": "캐비닛",
  "KITCHEN_CABINET": "찬장",
  "KITCHEN_ISLAND": "주방아일랜드",
  "DRAWER": "서랍장",
  "NIGHTSTAND": "협탁",
  "BOOKSHELF": "책장",
  "DISPLAY_SHELF": "전시대/선반",
  "REFRIGERATOR": "냉장고",
  "WARDROBE": "장롱/수납장",
  "SOFA": "소파",
  "BED": "침대",
  "DINING_TABLE": "식탁",
  "MONITOR_TV": "모니터/TV",
  "DESK": "책상",
  "CHAIR_STOOL": "의자/스툴",
  "WASHING_MACHINE": "세탁기",
  "DRYER": "건조기",
  "POTTED_PLANT": "화분/식물",
  "KIMCHI_REFRIGERATOR": "김치냉장고",
  "VANITY_TABLE": "화장대",
  "TV_STAND": "TV 거치대",
  "PIANO": "피아노",
  "MASSAGE_CHAIR": "안마의자",
  "TREADMILL": "러닝머신",
  "EXERCISE_BIKE": "실내자전거",
};

export const typeTranslations: { [key: string]: string } = {
  "CEILING_MOUNTED_AIR_CONDITIONER_VENT": "천장형에어컨",
  "WALL_MOUNTED_AIR_CONDITIONER": "벽걸이에어컨",
  "STANDING_AIR_CONDITIONER": "스탠딩에어컨",
  "MOVABLE_REFRIGERATOR": "이동형냉장고",
  "BUILT_IN_REFRIGERATOR": "빌트인냉장고",
  "BUILT_IN_WARDROBE": "빌트인옷장",
  "MOVABLE_WARDROBE": "이동형옷장",
  "SYSTEM_HANGER": "행거",
  "SINGLE_SOFA": "1인용소파",
  "TWIN_SOFA": "2인용소파",
  "THREE_SEATER_SOFA": "3인용소파",
  "L_SHAPED_SOFA": "L자형소파",
  "SINGLE_BED": "1인용침대",
  "SUPER_SINGLE_BED": "2인용침대",
  "DOUBLE_BED": "더블사이즈침대",
  "QUEEN_SIZE_BED": "퀸사이즈침대",
  "KING_SIZE_BED": "킹사이즈침대",
  "BUNK_BED": "2층침대",
  "TWO_PERSON_DINING_TABLE": "2인용식탁",
  "FOUR_PERSON_DINING_TABLE": "4인용식탁",
  "SIX_PERSON_DINING_TABLE": "6인용식탁",
  "STANDARD_DESK": "일반책상",
  "L_SHAPED__DESK": "L자형책상",
  "COMPUTER_DESK": "컴퓨터책상",
  "STANDARD_CHAIR": "일반의자",
  "ROUND_STOOL": "원형의자",
  "DRUM_WASHING_MACHINE": "드럼세탁기",
  "TOP_LOADING_WASHING_MACHINE": "통세탁기",
  "VANITY_TABLE_WITH_ATTACHED_MIRROR": "거울화장대",
  "CONSOLE_VANITY_TABLE": "콘솔화장대",
  "WALL_MOUNTED_TV_BRACKET": "벽걸이TV거치대",
  "TV_ENTERTAINMENT_CENTER_WITH_STORAGE": "TV거치장식대",
  "LOW_TV_STAND": "낮은TV거치대",
  "UPRIGHT_VERTICAL_PIANO": "업라이트피아노",
  "GRAND_PIANO": "그랜드피아노",
  "DIGITAL_PIANO": "디지털피아노",
};

export const truckTypeTranslations: { [key: string]: string } = {
  "TRUCK_1_TON": "1Ton",
  "TRUCK_2_5_TON": "2.5Ton",
  "TRUCK_5_TON": "5Ton",
}

export function translateLabel(label: string): string {
  if(label) return furnitureTranslations[label] || '번역되지 않음';
  else return '값이 없음';
}

export function translateType(type: string): string {
  if(type) return typeTranslations[type] || '번역되지 않음';
  else return '';
}

export function translateTruckType(truckType: string): string {
  if(truckType) return truckTypeTranslations[truckType] || '번역되지 않음';
  else return '값이 없음';
}