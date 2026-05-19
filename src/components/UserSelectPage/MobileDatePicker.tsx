import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { getKoreanHolidays } from '../../utils/holidays';

interface Props {
  value: string | null;
  onSelect: (date: string) => void;
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const SON_EOMNUN_DAYS = new Set([9, 10, 19, 20, 29, 30]);

function getLunarDay(year: number, month: number, day: number): number {
  const cal = new KoreanLunarCalendar();
  cal.setSolarDate(year, month, day);
  return cal.getLunarCalendar().day;
}

export default function MobileDatePicker({ value, onSelect }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7).concat(Array(7 - days.slice(i, i + 7).length).fill(null)));
  }

  // 공휴일 목록 캐싱
  const holidays = useMemo(() => getKoreanHolidays(year), [year]);

  // 현재 월의 손없는날 목록 (음력 변환 결과 캐싱)
  const sonEomnunSet = useMemo(() => {
    const set = new Set<number>();
    for (let d = 1; d <= lastDate; d++) {
      const lunarDay = getLunarDay(year, month + 1, d);
      if (SON_EOMNUN_DAYS.has(lunarDay)) set.add(d);
    }
    return set;
  }, [year, month]);

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return day === d && month === m - 1 && year === y;
  };

  const handlePress = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onSelect(`${year}-${mm}-${dd}`);
  };

  return (
    <View style={styles.container}>
      {/* 월 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.monthYear}>{year}년 {month + 1}월</Text>
          <View style={styles.controls}>
            <TouchableOpacity onPress={prevMonth} hitSlop={8}>
              <ChevronLeft size={16} color="#1F2024" />
            </TouchableOpacity>
            <TouchableOpacity onPress={nextMonth} hitSlop={8}>
              <ChevronRight size={16} color="#1F2024" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 요일 헤더 */}
        <View style={styles.weekRow}>
          {WEEK_DAYS.map((d, i) => (
            <View key={i} style={styles.weekCell}>
              <Text style={styles.weekText}>{d}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.daysContainer}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekDayRow}>
            {week.map((day, di) => {
              const selected = day !== null && isSelected(day);
              const todayCell = day !== null && isToday(day);
              const sonEomnun = day !== null && sonEomnunSet.has(day);
              const holidayKey = day !== null
                ? `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : null;
              const isHoliday = holidayKey !== null && holidays.has(holidayKey);
              return (
                <TouchableOpacity
                  key={di}
                  style={[
                    styles.dayCell,
                    todayCell && !selected && styles.todayCell,
                    selected && styles.selectedCell,
                  ]}
                  onPress={() => day && handlePress(day)}
                  disabled={day === null}
                  activeOpacity={0.7}
                >
                  {day !== null && (
                    <>
                      <Text style={[
                        styles.dayText,
                        (isHoliday || di === 0) && styles.holidayText,
                        selected && styles.selectedDayText,
                      ]}>
                        {day}
                      </Text>
                      {sonEomnun && (
                        <View style={[styles.sonDot, selected && styles.sonDotSelected]} />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* 손없는날 범례 */}
      <View style={styles.legend}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>손없는날</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 9,
  },
  header: {
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  monthYear: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2024',
  },
  controls: {
    flexDirection: 'row',
    gap: 22,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekCell: {
    width: 40,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8F9098',
    letterSpacing: 0.5,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  legendDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#006FFD',
  },
  legendText: {
    fontSize: 11,
    color: '#71727A',
    fontWeight: '500',
  },
  daysContainer: {
    gap: 0,
  },
  weekDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    backgroundColor: '#F8F9FE',
  },
  selectedCell: {
    backgroundColor: '#006FFD',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#494A50',
  },
  selectedDayText: {
    color: '#fff',
  },
  holidayText: {
    color: '#FF4444',
  },
  sonDot: {
    position: 'absolute',
    bottom: 3,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#006FFD',
  },
  sonDotSelected: {
    backgroundColor: '#fff',
  },
});
