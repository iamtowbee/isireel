import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Terminal from '../components/Terminal';

const TerminalScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.terminalContainer}>
        <Terminal />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  terminalContainer: {
    flex: 1,
  },
});

export default TerminalScreen;
