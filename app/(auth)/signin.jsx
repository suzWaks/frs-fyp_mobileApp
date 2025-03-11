import { View, Text, Button, StyleSheet } from 'react-native';
import React from 'react';
import { Link, router } from 'expo-router';

export default function SignInScreen() {
  const handleLogin = () => {
    router.push('/home');
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Button title="Login" onPress={handleLogin} />
      <Link href="/signup" style={styles.link}>Don't have an account? Sign up</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  link: {
    marginTop: 20,
    color: 'blue',
  },
});