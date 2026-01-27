import { Text, View, Platform, StyleSheet } from "react-native";
import { useEffect } from "react";

interface AlertBoxProps {
  value: string;
  onClose: () => void;
}

export default function AlertBox({ value, onClose }: AlertBoxProps) {
  useEffect(() => {
    const timer = setTimeout(() => { onClose() }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);


  return(
    <View style={styles.container}>
      <View style={styles.iconContent}>
        <Text style={styles.iconText}>!</Text>
      </View>
      <Text style={styles.text}>{value}</Text>
    </View>
  )    
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f0e7ff',
    // 그림자 설정
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    
    // 위치 고정 설정
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    zIndex: 9999,
    ...Platform.select({
      web: {
        bottom: 30,
        right: 30,
      },
      default: {
        bottom: 30,
        right: 30,
      }
    })
  },
  iconContent: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3D3D3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    paddingLeft: 1,
    paddingBottom: 1,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3D3D3A',
  },
})