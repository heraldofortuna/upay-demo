import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, CardData } from '../types';
import { Loader } from '../components';

type ReadingCardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ReadingCard'
>;

type ReadingCardScreenRouteProp = RouteProp<RootStackParamList, 'ReadingCard'>;

interface Props {
  navigation: ReadingCardScreenNavigationProp;
  route: ReadingCardScreenRouteProp;
}

export const ReadingCardScreen: React.FC<Props> = ({ navigation, route }) => {
  const [cardData, setCardData] = useState<CardData | null>(
    route.params?.cardData || null
  );
  const [isReading, setIsReading] = useState(true);

  useEffect(() => {
    // Simular lectura de tarjeta
    // En producción, aquí procesarías los datos reales de la tarjeta NFC
    const timer = setTimeout(() => {
      setIsReading(false);
      if (!cardData) {
        // Si no hay datos de tarjeta, simular que se leyó correctamente
        setCardData({
          cardNumber: '**** **** **** 1234',
          cardType: 'credit',
          expiryDate: '12/25',
          holderName: 'TARJETA DE PRUEBA',
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [cardData]);

  if (isReading) {
    return <Loader text="Leyendo tarjeta..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>💳</Text>
        <Text style={styles.title}>Tarjeta detectada</Text>
        {cardData && (
          <View style={styles.cardInfo}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>
              {cardData.cardType === 'credit' ? 'Crédito' : 'Débito'}
            </Text>
            {cardData.cardNumber && (
              <>
                <Text style={styles.label}>Número:</Text>
                <Text style={styles.value}>{cardData.cardNumber}</Text>
              </>
            )}
            {cardData.holderName && (
              <>
                <Text style={styles.label}>Titular:</Text>
                <Text style={styles.value}>{cardData.holderName}</Text>
              </>
            )}
            {cardData.expiryDate && (
              <>
                <Text style={styles.label}>Vence:</Text>
                <Text style={styles.value}>{cardData.expiryDate}</Text>
              </>
            )}
          </View>
        )}
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
    marginBottom: 32,
    textAlign: 'center',
  },
  cardInfo: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
});
