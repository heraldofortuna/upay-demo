import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Button } from '../components';

type LinkingStep1ScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LinkingStep1'
>;

interface Props {
  navigation: LinkingStep1ScreenNavigationProp;
}

export const LinkingStep1Screen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    navigation.navigate('LinkingStep2');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
         ¡Te damos la bienvenida a tu uPOS!
        </Text>
        <Text style={styles.subtitle}>
          Llegó el nuevo aliado para tu negocio.
          Deslizá para conocer más.
        </Text>
      </View>
      <View style={styles.footer}>
        <Button title="Comenzar" onPress={handleContinue} />
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
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 24,
  },
});
