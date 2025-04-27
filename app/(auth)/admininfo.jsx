// import React from 'react';
// import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
// import { Link } from 'expo-router';

// export default function AdminInfo() {
//   return (
//     <ImageBackground
//       source={require('D:\frs-fyp_mobileApp\assets\images\msg.png')} 
//       style={styles.backgroundImage}
//       resizeMode="contain" 
//     >
//       <View style={styles.container}>
//         {/* Title with rgba transparency */}
//         <Text style={[styles.title, { color: 'rgba(118, 71, 235, 0.7)' }]}>Contact IT Officer</Text>
//         <Text style={styles.text}>
//           For any issues related to your account for this application
//           {'\n'}Mr.Jiwan Gurung | +975-17739187
//           {'\n'}jiwancst@rub.edu.bt
//         </Text>
//         {/* Purple "Call Now" Button */}
//         <TouchableOpacity style={styles.button} onPress={() => alert('Calling admin...')}>
//           <Text style={styles.buttonText}>Call Now</Text>
//         </TouchableOpacity>

//         <Link href="/" style={styles.link}>Go back to Sign In</Link>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   backgroundImage: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center', 
//     width: '100%', 
//     height: '100%', 
//     alignSelf: 'center', 
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)', 
//     width: '100%', 
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#7647EB',
//   },
//   text: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 20,
//     color: 'rgba(164, 156, 156, 0.7)'
//   },
//   link: {
//     color: 'blue',
//     marginTop: 20,
//   },
//   button: {
//     backgroundColor: '#7647EB', 
//     paddingVertical: 15,
//     paddingHorizontal: 90,
//     borderRadius: 25,
//     marginTop: 20,
//   },
//   emailButton: {
//     backgroundColor: '#4CAF50', // Green color for the Email button
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });