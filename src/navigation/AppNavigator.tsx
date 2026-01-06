/**
 * Navegador principal - Usa SDUI para renderizado dinámico
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { SDUIScreen } from '../screens/SDUIScreen';
import { ErrorScreen } from '../screens/ErrorScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SDUIScreen"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {/* Pantalla genérica SDUI - renderiza todas las pantallas dinámicamente */}
        <Stack.Screen 
          name="SDUIScreen" 
          component={SDUIScreen}
          initialParams={{ screenId: 'Initializing' }}
        />
        
        {/* Pantalla de error como fallback */}
        <Stack.Screen name="Error" component={ErrorScreen} />
        
        {/* Mantenemos las pantallas antiguas por compatibilidad, pero deberían redirigir a SDUIScreen */}
        <Stack.Screen name="Initializing" component={SDUIScreen} 
          options={{ 
            // Redirigir a SDUIScreen con el screenId correspondiente
            initialParams: { screenId: 'Initializing' }
          }} 
        />
        <Stack.Screen name="Waiting" component={SDUIScreen}
          options={{ initialParams: { screenId: 'Waiting' } }}
        />
        <Stack.Screen name="LinkingStep1" component={SDUIScreen}
          options={{ initialParams: { screenId: 'LinkingStep1' } }}
        />
        <Stack.Screen name="LinkingStep2" component={SDUIScreen}
          options={{ initialParams: { screenId: 'LinkingStep2' } }}
        />
        <Stack.Screen name="LinkingStep3" component={SDUIScreen}
          options={{ initialParams: { screenId: 'LinkingStep3' } }}
        />
        <Stack.Screen name="OtpScreen" component={SDUIScreen}
          options={{ initialParams: { screenId: 'OtpScreen' } }}
        />
        <Stack.Screen name="Linking" component={SDUIScreen}
          options={{ initialParams: { screenId: 'Linking' } }}
        />
        <Stack.Screen name="ReadingCard" component={SDUIScreen}
          options={{ initialParams: { screenId: 'ReadingCard' } }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};