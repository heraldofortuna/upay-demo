import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Button } from '../components';
import { textService } from '../services/textService';

type ErrorScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Error'
>;

type ErrorScreenRouteProp = RouteProp<RootStackParamList, 'Error'>;

interface Props {
  navigation: ErrorScreenNavigationProp;
  route: ErrorScreenRouteProp;
}

export const ErrorScreen: React.FC<Props> = ({ navigation, route }) => {
  const texts = textService.getScreenTexts('Error');
  const message = route.params?.message || texts.defaultMessage;

  const handleRetry = () => {
    navigation.replace('Initializing');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>{texts.title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.footer}>
        <Button title={texts.buttonRetry} onPress={handleRetry} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 24,
  },
});
