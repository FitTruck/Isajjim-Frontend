import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface Props {
  date: string | null;
  onSelect: (date: string) => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export default function DateSelector({ date, onSelect, isOpen: controlledOpen, onToggle }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  useEffect(() => {
    if (date) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [isOpen]);

  const toggleCalendar = () => {
    if (isControlled) {
      onToggle && onToggle(!isOpen);
    } else {
      setInternalOpen(!isOpen);
    }
  };

  const handleSelect = (dateStr: string) => {
    onSelect(dateStr);
    if (isControlled) {
      onToggle && onToggle(false);
    } else {
      setInternalOpen(false);
    }
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const getDaysArray = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const days = getDaysArray(currentYear, currentMonth);

  const formattedDate = date ? date : '날짜를 선택해주세요';
  const isSelected = !!date;

  return (
    <View style={[styles.container, { zIndex: isOpen ? 2000 : 1 }, isMobile && styles.mobileContainer]}>
      <Text style={[styles.label, isMobile && {fontSize: 22}]}>이사 희망 날짜</Text>
      
      <TouchableOpacity 
        style={[styles.inputBox, isOpen && styles.inputBoxOpen]}
        onPress={toggleCalendar}
        activeOpacity={0.8}
      >
        <Text style={[styles.dateText, !isSelected && styles.placeholderText]}>
          {formattedDate}
        </Text>
        <Calendar size={20} color={isOpen ? "#F0893B" : "#666"} />      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.calendarContainer, isMobile && styles.mobileCalendarContainer]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
                <ChevronLeft size={24} color="#333" />              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {currentYear}년 {currentMonth + 1}월
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
                <ChevronRight size={24} color="#333" />              </TouchableOpacity>
            </View>

            {/* Week Days */}
            <View style={styles.weekRow}>
              {weekDays.map((day, index) => (
                <Text key={index} style={[
                  styles.weekDayText,
                  index === 0 && styles.sundayText,
                  index === 6 && styles.saturdayText
                ]}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {days.map((day, index) => {
                const isPlaceholder = day === null;
                const isSelectedDay = 
                  date && 
                  String(day).padStart(2, '0') === date.split('-')[2] &&
                  (currentMonth + 1) === parseInt(date.split('-')[1]) &&
                  currentYear === parseInt(date.split('-')[0]);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      isSelectedDay && styles.selectedDayCell,
                      isMobile && styles.mobileDayCell
                    ]}
                    disabled={isPlaceholder}
                    onPress={() => {
                        if (day) {
                             const monthStr = String(currentMonth + 1).padStart(2, '0');
                             const dayStr = String(day).padStart(2, '0');
                             const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
                             handleSelect(dateStr);
                        }
                    }}
                  >
                    {!isPlaceholder && (
                      <Text style={[
                        styles.dayText,
                        index % 7 === 0 && styles.sundayText,
                        index % 7 === 6 && styles.saturdayText, 
                        isSelectedDay && styles.selectedDayText
                      ]}>
                        {day}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20, // 마진 줄임 (UserSelect에서 제어 가능하도록)
    width: '70%',
    position: 'relative',
    zIndex: 100, // 드롭다운 등과 겹침 문제 방지
  },
  mobileContainer: {
    width: '100%',
  },
  label: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
    textAlign: 'left',
  },
  inputBox: {
    width: '100%',
    // maxWidth: 300, // UserSelect 레이아웃에 맞춤
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputBoxOpen: {
    borderColor: '#F0893B',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  
  calendarContainer: {
    position: 'absolute',
    top: '100%',
    left: 0, 
    marginTop: 4,
    width: 320,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mobileCalendarContainer: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  arrowButton: {
    padding: 5,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    fontSize: 14,
    color: '#666',
    width: 35,
    textAlign: 'center',
  },
  sundayText: {
    color: '#FF4444',
  },
  saturdayText: {
    color: '#4444FF',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderRadius: 20,
  },
  mobileDayCell: {
    height: 40,
  },
  selectedDayCell: {
    backgroundColor: '#F0893B',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
