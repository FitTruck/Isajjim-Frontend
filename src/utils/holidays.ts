import KoreanLunarCalendar from 'korean-lunar-calendar';

// 음력 날짜 → 양력 날짜 변환
function lunarToSolar(year: number, month: number, day: number): { month: number; day: number } {
  const cal = new KoreanLunarCalendar();
  cal.setLunarDate(year, month, day, false);
  const solar = cal.getSolarCalendar();
  return { month: solar.month, day: solar.day };
}

// 특정 연도의 대한민국 공휴일 반환 (Map<'MM-DD', string>)
export function getKoreanHolidays(year: number): Map<string, string> {
  const holidays = new Map<string, string>();

  const add = (month: number, day: number, name: string) => {
    const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    holidays.set(key, name);
  };

  // 고정 공휴일
  add(1, 1, '신정');
  add(3, 1, '삼일절');
  add(5, 5, '어린이날');
  add(6, 6, '현충일');
  add(8, 15, '광복절');
  add(10, 3, '개천절');
  add(10, 9, '한글날');
  add(12, 25, '성탄절');

  // 음력 기반 공휴일
  const seollal = lunarToSolar(year, 1, 1);
  add(seollal.month - 1 === 0 ? 12 : seollal.month - 1,
    seollal.day === 1 ? new Date(year, seollal.month - 1, 0).getDate() : seollal.day - 1,
    '설날 연휴');
  add(seollal.month, seollal.day, '설날');
  const seollalNext = new Date(year, seollal.month - 1, seollal.day + 1);
  add(seollalNext.getMonth() + 1, seollalNext.getDate(), '설날 연휴');

  const buddha = lunarToSolar(year, 4, 8);
  add(buddha.month, buddha.day, '부처님오신날');

  const chuseok = lunarToSolar(year, 8, 15);
  const chuseokPrev = new Date(year, chuseok.month - 1, chuseok.day - 1);
  const chuseokNext = new Date(year, chuseok.month - 1, chuseok.day + 1);
  add(chuseokPrev.getMonth() + 1, chuseokPrev.getDate(), '추석 연휴');
  add(chuseok.month, chuseok.day, '추석');
  add(chuseokNext.getMonth() + 1, chuseokNext.getDate(), '추석 연휴');

  return holidays;
}
