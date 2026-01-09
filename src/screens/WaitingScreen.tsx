import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CardData } from '../types';
import { useNfcDetection } from '../hooks/useNfcDetection';
import { textService } from '../services/textService';

type WaitingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Waiting'
>;

interface Props {
  navigation: WaitingScreenNavigationProp;
}

export const WaitingScreen: React.FC<Props> = ({ navigation }) => {
  const handleCardDetected = useCallback(
    (cardData?: CardData) => {
      // Cuando se detecta una tarjeta, navegar a la pantalla de lectura
      navigation.navigate('ReadingCard', { cardData });
    },
    [navigation]
  );

  // Hook para detectar tarjetas NFC
  const { startDetection } = useNfcDetection({
    onCardDetected: handleCardDetected,
    enabled: true,
  });

  useEffect(() => {
    // Iniciar la detección cuando la pantalla se monta
    startDetection();

    // Limpiar cuando la pantalla se desmonta
    return () => {
      // La limpieza se maneja en el hook
    };
  }, [startDetection]);

  // Para testing: en desarrollo puedes simular la detección
  // presionando un botón o usando un gesto
  const simulateCardDetection = () => {
    handleCardDetected({
      cardNumber: '**** **** **** 1234',
      cardType: 'credit',
      expiryDate: '12/25',
      holderName: 'TARJETA DE PRUEBA',
    });
  };

  const texts = textService.getScreenTexts('Waiting');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{texts.title}</Text>
      <Text style={styles.subtitle}>{texts.subtitle}</Text>
      {__DEV__ && (
        <Text style={styles.devHint} onPress={simulateCardDetection}>
          [DEV] Tocar para simular tarjeta
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  devHint: {
    marginTop: 32,
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
