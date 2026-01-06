import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Button } from '../components';

type LinkingStep2ScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LinkingStep2'
>;

interface Props {
  navigation: LinkingStep2ScreenNavigationProp;
}

export const LinkingStep2Screen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    navigation.navigate('LinkingStep3');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
         Vinculá una caja para operar
        </Text>
        <Text style={styles.subtitle}>
          Solo tenés que ingresar el código de seguridad en una caja de tu comercio.
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
