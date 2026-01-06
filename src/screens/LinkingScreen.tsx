import React, { useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { apiService } from '../services/api';
import { Loader } from '../components';

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
            message: response.message || 'Error al vincular el uPOS. Por favor, intenta nuevamente.',
          });
        }
      } catch (error) {
        navigation.replace('Error', {
          message: 'Error al vincular el uPOS. Por favor, intenta nuevamente.',
        });
      }
    };

    link();
  }, [otp, navigation]);

  return <Loader text="Estamos vinculando el uPOS a la caja" />;
};
