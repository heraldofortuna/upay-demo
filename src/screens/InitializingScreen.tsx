import React, { useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { apiService } from '../services/api';
import { Loader } from '../components';
import { textService } from '../services/textService';

type InitializingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Initializing'
>;

interface Props {
  navigation: InitializingScreenNavigationProp;
}

export const InitializingScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await apiService.initialize();
        
        if (response.isLinked) {
          navigation.replace('Waiting');
        } else {
          navigation.replace('LinkingStep1');
        }
      } catch (error) {
        navigation.replace('Error', {
          message: textService.getError('initialize'),
        });
      }
    };

    initialize();
  }, [navigation]);

  const loaderText = textService.getScreenText('Initializing', 'loaderText');
  return <Loader text={loaderText} />;
};
