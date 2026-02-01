import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  date: string | null;
  onSelect: (date: string) => void;
}

export default function DateSelector({ date, onSelect }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
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
  }, [modalVisible]);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const getDaysArray = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of current month
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

  const handleDaySelect = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    onSelect(dateStr);
    setModalVisible(false);
  };

  const days = getDaysArray(currentYear, currentMonth);

  const formattedDate = date ? date : '날짜를 선택해주세요';
  const isSelected = !!date;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>이사 희망 날짜</Text>
      
      <TouchableOpacity 
        style={styles.inputBox}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dateText, !isSelected && styles.placeholderText]}>
          {formattedDate}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {currentYear}년 {currentMonth + 1}월
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
                <Ionicons name="chevron-forward" size={24} color="#333" />
              </TouchableOpacity>
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
                      isSelectedDay && styles.selectedDayCell
                    ]}
                    disabled={isPlaceholder}
                    onPress={() => day && handleDaySelect(day)}
                  >
                    {!isPlaceholder && (
                      <Text style={[
                        styles.dayText,
                        index % 7 === 0 && styles.sundayText, // Sunday column
                        index % 7 === 6 && styles.saturdayText, // Saturday column
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
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 40,
    maxWidth: 1280,
    alignSelf: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3D3D3A',
    textAlign: 'left',
  },
  inputBox: {
    width: '100%',
    maxWidth: 300,
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
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
    // justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%', // 7 days in a row
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderRadius: 20,
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
