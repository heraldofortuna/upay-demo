/**
 * Navegador principal usando Server-Driven UI (SDUI)
 * Todas las pantallas se renderizan dinámicamente desde el servidor
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { SDUIScreen } from '../screens/SDUIScreen';
import { ErrorScreen } from '../screens/ErrorScreen'; // Mantenemos esta como fallback

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigatorSDUI: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SDUIScreen"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {/* Pantalla genérica SDUI - todas las pantallas se renderizan aquí */}
        <Stack.Screen 
          name="SDUIScreen" 
          component={SDUIScreen}
          initialParams={{ screenId: 'Initializing' }}
        />
        
        {/* Pantalla de error como fallback */}
        <Stack.Screen name="Error" component={ErrorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};