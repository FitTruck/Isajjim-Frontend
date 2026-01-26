import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  // --- Container Styles ---
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
  },
  mainWrapper: {
    width: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
  },


  // --- Main Section Styles ---
  mainSection: {
    marginTop: 220,
    width: 837,
    alignItems: 'center',
    alignSelf: 'center',
    gap: 23,
  },
  mainTitle: {
    fontSize: 64,
    fontWeight: '700',
    color: '#3D3D3A',
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 24,
    color: '#62625D',
    textAlign: 'center',
    lineHeight: 36,
  },
  
  // --- Footer Styles ---
  footer: {
    position: 'relative',
    bottom: 0,
    width: '100%',
    height: 264,
    backgroundColor: 'transparent',
    paddingHorizontal: 80,
  },
  footerLine: {
    height: 1,
    backgroundColor: '#E6E6E6',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 80,
  },
  footerLogo: {
    fontSize: 24,
    color: '#3D3D3A',
    marginTop: 52,
  },
  footerLinksRow: {
    flexDirection: 'row',
    position: 'absolute',
    right: 80,
    top: 48,
    gap: 32,
  },
  footerColumn: {
    width: 187,
    alignItems: 'flex-end',
    gap: 24,
  },
  footerTopic: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3D3D3A',
  },
  footerPage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3D3D3A',
  },
  socialIcons: {
    position: 'absolute',
    left: 80,
    top: 176,
    flexDirection: 'row',
    gap: 8,
  },
  socialIconPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#F7F7F7',
    borderRadius: 4,
  },
});
