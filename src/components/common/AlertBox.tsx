import { Text, View, Platform, StyleSheet } from "react-native";

export default function AlertBox({ value }: { value: string }) {
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    // 그림자 설정
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    
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