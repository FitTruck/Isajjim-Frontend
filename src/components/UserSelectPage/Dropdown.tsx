import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform, ScrollView, Image } from 'react-native';

interface Option {
  label: string;
  value: string | boolean | number;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value: string | boolean | number | null;
  options: Option[];
  onSelect: (value: any) => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export default function Dropdown({ label, placeholder = '선택해주세요', value, options, onSelect, isOpen: controlledOpen, onToggle }: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const selectedOption = options.find(opt => opt.value === value);

  const toggleDropdown = () => {
    if (isControlled) {
      onToggle && onToggle(!isOpen);
    } else {
      setInternalOpen(!isOpen);
    }
  };

  const handleSelect = (itemValue: any) => {
    onSelect(itemValue);
    if (isControlled) {
      onToggle && onToggle(false);
    } else {
      setInternalOpen(false);
    }
  };

  return (
    <View style={[styles.container, { zIndex: isOpen ? 2000 : 1 }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity 
        style={[styles.inputBox, isOpen && styles.inputBoxOpen]} 
        onPress={toggleDropdown}
        activeOpacity={0.8}
      >
        <Text style={[styles.inputValue, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {isOpen ? 
          <Image style={styles.arrowIcon} source={require('../../../assets/up.png')} /> : 
          <Image style={styles.arrowIcon} source={require('../../../assets/bottom.png')} />
        }
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownListContainer}>
          <ScrollView 
            style={styles.dropdownList} 
            nestedScrollEnabled={true}
            contentContainerStyle={styles.listContent}
          >
            {options.map((item, index) => (
             <TouchableOpacity
                  key={String(item.value)}
                  style={[
                    styles.dropdownItem,
                    value === item.value && styles.dropdownItemSelected,
                    index === options.length - 1 && styles.lastItem
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    value === item.value && styles.dropdownItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  inputBox: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  inputBoxOpen: {
    borderColor: '#F0893B',
  },
  inputValue: {
    fontSize: 16,
    color: '#333333',
  },
  placeholder: {
    color: '#999',
  },
  arrowIcon: {
    width: 14,
    height: 14,
    tintColor: '#999',
    resizeMode: 'contain',
  },
  
  dropdownListContainer: {
    position: 'absolute',
    top: '100%', 
    left: 0,
    right: 0,
    marginTop: 4, 
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    maxHeight: 200, 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000, 
  },
  dropdownList: {
    width: '100%',
    maxHeight: 200,
  },
  listContent: {
    paddingVertical: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: '#FFF0E6', 
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#F0893B',
    fontWeight: '600',
  },
});
