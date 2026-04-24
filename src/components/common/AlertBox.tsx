import { Text, View, StyleSheet, useWindowDimensions } from "react-native";
import { useEffect } from "react";

interface AlertBoxProps {
  value: string;
  onClose: () => void;
}

export default function AlertBox({ value, onClose }: AlertBoxProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    const timer = setTimeout(() => { onClose() }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);


  return(
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
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
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    position: 'absolute',
    zIndex: 9999,
    bottom: 30,
    right: 30,
  },
  mobileContainer: {
    bottom: 20,
    left: 16,
    right: 16,
  },
  iconContent: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333333',
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
    color: '#333333',
  },
})