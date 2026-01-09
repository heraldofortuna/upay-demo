import React, { useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { apiService } from '../services/api';
import { Loader } from '../components';
import { textService } from '../services/textService';

type LinkingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Linking'
>;

type LinkingScreenRouteProp = RouteProp<RootStackParamList, 'Linking'>;

interface Props {
  navigation: LinkingScreenNavigationProp;
  route: LinkingScreenRouteProp;
}

export const LinkingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { otp } = route.params;

  useEffect(() => {
    const link = async () => {
      try {
        const response = await apiService.link(otp);
        
        if (response.success) {
          navigation.replace('Waiting');
        } else {
          navigation.replace('Error', {
            message: response.message || textService.getError('link'),
          });
        }
      } catch (error) {
        navigation.replace('Error', {
          message: textService.getError('link'),
        });
      }
    };

    link();
  }, [otp, navigation]);

  const loaderText = textService.getScreenText('Linking', 'loaderText');
  return <Loader text={loaderText} />;
};
