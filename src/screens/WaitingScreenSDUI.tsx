/**
 * Versión mejorada de WaitingScreen con soporte SDUI + NFC
 */

import React, { useEffect, useCallback } from 'react';
import { SDUIScreen } from './SDUIScreen';
import { useNfcDetection } from '../hooks/useNfcDetection';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, CardData } from '../types';

type WaitingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SDUIScreen'>;
type WaitingScreenRouteProp = RouteProp<RootStackParamList, 'SDUIScreen'>;

interface Props {
  navigation: WaitingScreenNavigationProp;
  route: WaitingScreenRouteProp;
}

export const WaitingScreenSDUI: React.FC<Props> = ({ navigation, route }) => {
  const handleCardDetected = useCallback(
    (cardData?: CardData) => {
      navigation.navigate('SDUIScreen', {
        screenId: 'ReadingCard',
        cardData,
      });
    },
    [navigation]
  );

  const { startDetection } = useNfcDetection({
    onCardDetected: handleCardDetected,
    enabled: route.params?.screenId === 'Waiting',
  });

  useEffect(() => {
    if (route.params?.screenId === 'Waiting') {
      startDetection();
    }
  }, [startDetection, route.params?.screenId]);

  // Si es Waiting, renderizar con NFC; si no, renderizar normalmente
  if (route.params?.screenId === 'Waiting') {
    // Pasamos el control a SDUIScreen pero mantenemos el hook NFC activo
    return <SDUIScreen navigation={navigation} route={route} />;
  }

  return <SDUIScreen navigation={navigation} route={route} />;
};