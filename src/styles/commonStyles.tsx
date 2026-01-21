import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  // --- Container Styles ---
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainWrapper: {
    width: '100%',
    position: 'relative',
    backgroundColor: 'white',
  },

  // --- Header Styles ---
  header: {
    width: '100%',
    height: 164,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'white',
    paddingHorizontal: 80,
    justifyContent: 'center',
    zIndex: 10,
  },
  logoText: {
    fontSize: 50,
    fontWeight: '500',
    color: 'black',
  },
  headerRight: {
    position: 'absolute',
    right: 80,
    top: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  mypageText: { 
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
  },
  loginButton: {
    backgroundColor: 'black',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },

  // --- Main Section Styles ---
  mainSection: {
    marginTop: 274,
    width: '100%',
    alignItems: 'center',
  },
  mainContent: {
    width: 837,
    alignItems: 'center',
    gap: 23,
  },
  mainTitle: {
    fontSize: 64,
    fontWeight: '700',
    color: 'black',
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 24,
    color: '#828282',
    textAlign: 'center',
    lineHeight: 36,
  },
  
  // --- Footer Styles ---
  footer: {
    position: 'relative',
    bottom: 0,
    width: '100%',
    height: 264,
    backgroundColor: 'white',
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
    color: 'black',
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
    color: 'black',
  },
  footerPage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#454545',
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
