/**
 * Navegador principal para la app OTA (Over-The-Air)
 * Usa SDUI con definiciones locales (actualizables vía OTA)
 * Permite cambiar estructura UI (botones, textos, vistas) sin rebuild
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { SDUIScreen } from '../screens/SDUIScreen';
import { OTAWrapper } from '../components/OTAWrapper';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigatorOTA: React.FC = () => {
  console.log('🚀 AppNavigatorOTA: Inicializando navegador OTA con SDUI');
  
  return (
    <OTAWrapper autoCheck={false} autoApply={false}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SDUIScreen"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          {/* Todas las pantallas usan SDUIScreen con diferentes screenId */}
          <Stack.Screen 
            name="SDUIScreen" 
            component={SDUIScreen}
            initialParams={{ screenId: 'Initializing' }}
          />
          {/* Mantener compatibilidad con rutas directas */}
          <Stack.Screen 
            name="Initializing" 
            component={SDUIScreen}
            initialParams={{ screenId: 'Initializing' }}
          />
          <Stack.Screen 
            name="Waiting" 
            component={SDUIScreen}
            initialParams={{ screenId: 'Waiting' }}
          />
          <Stack.Screen 
            name="LinkingStep1" 
            component={SDUIScreen}
            initialParams={{ screenId: 'LinkingStep1' }}
          />
          <Stack.Screen 
            name="LinkingStep2" 
            component={SDUIScreen}
            initialParams={{ screenId: 'LinkingStep2' }}
          />
          <Stack.Screen 
            name="LinkingStep3" 
            component={SDUIScreen}
            initialParams={{ screenId: 'LinkingStep3' }}
          />
          <Stack.Screen 
            name="OtpScreen" 
            component={SDUIScreen}
            initialParams={{ screenId: 'OtpScreen' }}
          />
          <Stack.Screen 
            name="Linking" 
            component={SDUIScreen}
            initialParams={{ screenId: 'Linking' }}
          />
          <Stack.Screen 
            name="ReadingCard" 
            component={SDUIScreen}
            initialParams={{ screenId: 'ReadingCard' }}
          />
          <Stack.Screen 
            name="Error" 
            component={SDUIScreen}
            initialParams={{ screenId: 'Error' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </OTAWrapper>
  );
};
