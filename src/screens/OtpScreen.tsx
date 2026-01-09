import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Button } from '../components';
import { apiService } from '../services/api';
import { textService } from '../services/textService';

type OtpScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OtpScreen'
>;

type OtpScreenRouteProp = RouteProp<RootStackParamList, 'OtpScreen'>;

interface Props {
  navigation: OtpScreenNavigationProp;
  route: OtpScreenRouteProp;
}

export const OtpScreen: React.FC<Props> = ({ navigation }) => {
  const [otp, setOtp] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchOtp = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOtp();
      setOtp(response.otp);
      setTimeLeft(response.expiresIn);
    } catch (error) {
      navigation.replace('Error', {
        message: textService.getError('otp'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchOtp();
  }, [fetchOtp]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Cuando el tiempo se agota, obtener nuevo OTP
      fetchOtp();
    }
  }, [timeLeft, fetchOtp]);

  const handleContinue = () => {
    if (otp) {
      navigation.navigate('Linking', { otp });
    }
  };

  const handleCancel = () => {
    navigation.navigate('LinkingStep1');
  };

  const texts = textService.getScreenTexts('OtpScreen');
  const timerText = timeLeft === 1 
    ? `${texts.timerPrefix} ${timeLeft} ${texts.timerSuffix}`
    : `${texts.timerPrefix} ${timeLeft} ${texts.timerSuffixPlural}`;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{texts.title}</Text>
        <Text style={styles.label}>{texts.label}</Text>
        {isLoading ? (
          <Text style={styles.otp}>{texts.loadingOtp}</Text>
        ) : (
          <Text style={styles.otp}>{otp}</Text>
        )}
        <Text style={styles.timer}>{timerText}</Text>
      </View>
      <View style={styles.footer}>
        <Button
          title={texts.buttonContinue}
          onPress={handleContinue}
          disabled={!otp || isLoading}
          style={styles.button}
        />
        <Button
          title={texts.buttonCancel}
          onPress={handleCancel}
          variant="secondary"
          disabled={isLoading}
          style={styles.button}
        />
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 24,
  },
  otp: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 8,
    marginBottom: 16,
  },
  timer: {
    fontSize: 14,
    color: '#999999',
  },
  footer: {
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    marginBottom: 0,
  },
});
