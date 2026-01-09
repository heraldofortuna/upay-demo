import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Button } from '../components';
import { textService } from '../services/textService';

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

  const texts = textService.getScreenTexts('LinkingStep2');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{texts.title}</Text>
        <Text style={styles.subtitle}>{texts.subtitle}</Text>
      </View>
      <View style={styles.footer}>
        <Button title={texts.button} onPress={handleContinue} />
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
