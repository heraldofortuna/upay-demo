/**
 * Pantalla genérica que renderiza definiciones SDUI del servidor
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { SDUIRenderer, SDUIDefinition } from '../engine/SDUIRenderer';
import { bffClient, ApiResponse } from '../services/bffClient';

type SDUIScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SDUIScreen'>;
type SDUIScreenRouteProp = RouteProp<RootStackParamList, 'SDUIScreen'>;

interface Props {
  navigation: SDUIScreenNavigationProp;
  route: SDUIScreenRouteProp;
}

export const SDUIScreen: React.FC<Props> = ({ navigation, route }) => {
  const screenId = route.params?.screenId || 'Initializing';
  const initialContext = route.params?.initialContext || {};
  const [definition, setDefinition] = useState<SDUIDefinition | null>(null);
  const [state, setState] = useState<Record<string, any>>(initialContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef(state);
  const previousScreenIdRef = useRef<string | null>(null);
  const hasExecutedActionsRef = useRef<Set<string>>(new Set());
  
  // Mantener la referencia del estado actualizada
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Limpiar estado cuando cambia el screenId (solo cuando realmente cambia)
  useEffect(() => {
    // Solo limpiar si el screenId realmente cambió
    if (previousScreenIdRef.current === screenId) {
      return;
    }
    
    console.log('[SDUIScreen] Screen changed to:', screenId, 'from:', previousScreenIdRef.current);
    const previousScreenId = previousScreenIdRef.current;
    previousScreenIdRef.current = screenId;
    
    // Limpiar estado anterior cuando cambia la pantalla (especialmente para OtpScreen)
    // Solo limpiar si realmente cambió de pantalla (no en el primer render)
    if (previousScreenId !== null) {
      const cleanState: Record<string, any> = {};
      // Si es OtpScreen, limpiar específicamente otp y timeLeft
      if (screenId === 'OtpScreen') {
        cleanState.otp = undefined;
        cleanState.timeLeft = undefined;
        cleanState.isLoading = true;
      }
      setState(cleanState);
      setError(null);
      setIsLoading(true);
      // También limpiar la definición para forzar recarga
      setDefinition(null);
      // Limpiar el registro de acciones ejecutadas cuando cambia de pantalla
      hasExecutedActionsRef.current.clear();
    }
  }, [screenId]); // Solo depender de screenId

  // Cargar definición de la pantalla
  useEffect(() => {
    console.log('[SDUIScreen] Loading screen:', screenId);
    loadScreenDefinition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenId]);

  // Ejecutar acciones automáticas al montar (solo una vez)
  useEffect(() => {
    if (!definition?.actions || !definition?.id) return;
    
    // Evitar ejecutar acciones múltiples veces para la misma definición
    const definitionKey = `${definition.id}-${definition.actions.map(a => a.id).join('-')}`;
    if (hasExecutedActionsRef.current.has(definitionKey)) {
      return;
    }
    
    // Pequeño delay para asegurar que el estado se haya limpiado
    const timer = setTimeout(() => {
      definition.actions?.forEach((action) => {
        // Ejecutar acciones automáticas (api_call sin onPress)
        if (action.type === 'api_call' && action.id) {
          console.log('[SDUIScreen] Executing auto action:', action.id);
          hasExecutedActionsRef.current.add(definitionKey);
          executeAction(action);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [definition?.id]);

  // Ejecutar hooks
  useEffect(() => {
    if (!definition?.hooks) return;

    const cleanupFunctions: (() => void)[] = [];

    definition.hooks.forEach((hook) => {
      if (hook.type === 'timer') {
        // Verificar condición inicial - solo iniciar timer si timeLeft existe y es > 0
        const currentState = stateRef.current;
        const initialCondition = evaluateCondition(hook.condition, currentState);
        
        // Solo iniciar el timer si la condición es verdadera (timeLeft > 0)
        // No ejecutar onExpire si timeLeft es undefined (aún no se ha cargado)
        if (initialCondition) {
          const interval = setInterval(() => {
            // Usar stateRef para acceder al estado actual
            const currentState = stateRef.current;
            const shouldContinue = evaluateCondition(hook.condition, currentState);
            
            if (shouldContinue && hook.onTick) {
              executeAction(hook.onTick);
            } else if (!shouldContinue && hook.onExpire) {
              // Solo ejecutar onExpire si timeLeft realmente llegó a 0 (no si es undefined)
              const timeLeftValue = currentState.timeLeft;
              if (timeLeftValue !== undefined && timeLeftValue <= 0) {
                console.log('[SDUIScreen] Timer expired, triggering action:', hook.onExpire);
                executeAction(hook.onExpire);
                clearInterval(interval);
              }
            }
          }, hook.interval || 1000);

          cleanupFunctions.push(() => clearInterval(interval));
        }
        // NO ejecutar onExpire si la condición es falsa inicialmente
        // Esto evita que se ejecute cuando timeLeft es undefined
      } else if (hook.type === 'delay') {
        const timeout = setTimeout(() => {
          if (hook.onComplete) {
            executeAction(hook.onComplete);
          }
        }, hook.duration || 1000);

        cleanupFunctions.push(() => clearTimeout(timeout));
      } else if (hook.type === 'nfc_detection' && hook.enabled) {
        // Esto se manejará con el hook useNfcDetection en la implementación específica
        // Por ahora, solo lo documentamos
      }
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definition?.id, state.timeLeft]); // Reiniciar el timer cuando timeLeft cambia (incluyendo cuando se renueva)

  const loadScreenDefinition = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[SDUIScreen] Fetching definition for:', screenId);
      // Usar el estado actual (que puede estar limpio si cambió el screenId)
      const def = await bffClient.getScreenDefinition(screenId, stateRef.current);
      console.log('[SDUIScreen] Definition loaded:', def?.id);
      setDefinition(def);
    } catch (err: any) {
      console.error('[SDUIScreen] Error loading screen definition:', err);
      setError(err.message || 'Error al cargar la pantalla');
      // No navegar inmediatamente, mostrar error en pantalla
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (action: any) => {
    try {
      if (action.type === 'api_call') {
        setIsLoading(true);
        const method = action.method || 'GET';
        const body = action.body ? interpolateObject(action.body, state) : undefined;

        const response = await bffClient.callApi<ApiResponse>(
          action.endpoint,
          { method, body }
        );

        // Actualizar estado con respuesta
        if (action.onSuccess) {
            if (action.onSuccess.type === 'update_state') {
              const newState = { ...state };
              Object.entries(action.onSuccess.state || {}).forEach(([key, value]) => {
                if (typeof value === 'string' && value.startsWith('response.')) {
                  const responseKey = value.replace('response.', '');
                  newState[key] = (response as any)[responseKey];
                } else if (typeof value === 'string' && value.includes(' - ')) {
                  // Para casos como "timeLeft - 1"
                  const currentValue = newState[key] || state[key] || 0;
                  const match = value.match(/^(.+?)\s*-\s*(\d+)$/);
                  if (match) {
                    newState[key] = Number(currentValue) - Number(match[2]);
                  }
                } else if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
                  // Interpolar valores del estado
                  const keyPath = value.replace(/\{\{|\}\}/g, '').trim();
                  newState[key] = getNestedValue(state, keyPath);
                } else {
                  newState[key] = value;
                }
              });
              setState(newState);
            } else if (action.onSuccess.type === 'navigate') {
              handleNavigate(action.onSuccess.screen, action.onSuccess.params);
            } else if (action.onSuccess.type === 'conditional') {
              handleConditionalNavigation(action.onSuccess, response);
            }
        }
      } else if (action.type === 'update_state') {
        const newState = { ...state };
        Object.entries(action.state || {}).forEach(([key, value]) => {
          if (typeof value === 'string' && value.includes(' - ')) {
            const currentValue = newState[key] || state[key] || 0;
            const match = value.match(/^(.+?)\s*-\s*(\d+)$/);
            if (match) {
              newState[key] = Number(currentValue) - Number(match[2]);
            }
          } else if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
            const keyPath = value.replace(/\{\{|\}\}/g, '').trim();
            newState[key] = getNestedValue(state, keyPath);
          } else {
            newState[key] = value;
          }
        });
        setState(newState);
      } else if (action.type === 'navigate') {
        handleNavigate(action.screen, action.params);
      } else if (action.type === 'trigger_action') {
        const targetAction = definition?.actions?.find(
          (a) => a.id === action.actionId
        );
        if (targetAction) {
          await executeAction(targetAction);
        }
      }
    } catch (err: any) {
      console.error('Error executing action:', err);
      if (action.onError) {
        if (action.onError.type === 'navigate') {
          handleNavigate(
            action.onError.screen,
            action.onError.params || {
              message: err.message || 'Ha ocurrido un error',
            }
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (screen: string, params?: any) => {
    const interpolatedParams = params ? interpolateObject(params, state) : undefined;
    
    // Si la pantalla es SDUIScreen, necesitamos mapear el screenId
    if (screen === 'Initializing' || screen === 'Waiting' || screen === 'LinkingStep1' || 
        screen === 'LinkingStep2' || screen === 'LinkingStep3' || screen === 'OtpScreen' || 
        screen === 'Linking' || screen === 'ReadingCard') {
      navigation.navigate('SDUIScreen', {
        screenId: screen,
        ...interpolatedParams,
      });
    } else if (screen === 'Error') {
      navigation.replace('Error', interpolatedParams || {});
    } else {
      // Intentar navegar directamente
      try {
        navigation.navigate(screen as any, interpolatedParams);
      } catch (e) {
        // Si falla, usar SDUIScreen como fallback
        navigation.navigate('SDUIScreen', {
          screenId: screen,
          ...interpolatedParams,
        });
      }
    }
  };

  const handleConditionalNavigation = (conditionalAction: any, response: any) => {
    const { condition, then, else: elseAction } = conditionalAction;
    const fieldValue = getNestedValue(response, condition.field);
    let conditionResult = false;

    switch (condition.operator) {
      case 'equals':
        conditionResult = fieldValue === condition.value;
        break;
      case 'notEquals':
        conditionResult = fieldValue !== condition.value;
        break;
      case 'greaterThan':
        conditionResult = fieldValue > condition.value;
        break;
      case 'lessThan':
        conditionResult = fieldValue < condition.value;
        break;
      default:
        conditionResult = true;
    }

    if (conditionResult && then) {
      if (then.type === 'navigate') {
        handleNavigate(then.screen, then.params);
      } else {
        executeAction(then);
      }
    } else if (!conditionResult && elseAction) {
      if (elseAction.type === 'navigate') {
        handleNavigate(elseAction.screen, elseAction.params);
      } else {
        executeAction(elseAction);
      }
    }
  };

  const handleAction = useCallback(
    (action: any) => {
      executeAction(action);
    },
    [state, definition]
  );

  const handleNavigateFromRenderer = useCallback(
    (screen: string, params?: any) => {
      handleNavigate(screen, params);
    },
    [state]
  );

  // Funciones auxiliares
  const evaluateCondition = (condition: any, state: Record<string, any>): boolean => {
    if (typeof condition === 'boolean') return condition;
    if (typeof condition === 'object' && condition !== null) {
      const { field, operator, value } = condition;
      const fieldValue = getNestedValue(state, field);

      switch (operator) {
        case 'equals':
          return fieldValue === value;
        case 'greaterThan':
          return fieldValue > value;
        case 'lessThan':
          return fieldValue < value;
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        case 'notExists':
          return fieldValue === undefined || fieldValue === null;
        default:
          return true;
      }
    }
    return true;
  };

  const interpolateObject = (obj: any, state: Record<string, any>): any => {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? interpolateString(obj, state) : obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => interpolateObject(item, state));
    }
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] =
        typeof value === 'string'
          ? interpolateString(value, state)
          : interpolateObject(value, state);
    }
    return result;
  };

  const interpolateString = (str: string, state: Record<string, any>): string => {
    if (typeof str !== 'string') return String(str);
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = getNestedValue(state, key);
      return value !== undefined && value !== null ? String(value) : match;
    });
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

  if (isLoading && !definition) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando pantalla: {screenId}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorDetail}>ScreenId: {screenId}</Text>
      </View>
    );
  }

  if (!definition) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>No se pudo cargar la definición de la pantalla</Text>
        <Text style={styles.errorDetail}>ScreenId: {screenId}</Text>
      </View>
    );
  }

  // Añadir params de la ruta al estado si existen
  const mergedState = {
    ...state,
    ...(route.params && Object.keys(route.params).length > 0
      ? { routeParams: route.params }
      : {}),
    message: route.params?.message || state.message,
    cardData: route.params?.cardData || state.cardData,
    otp: route.params?.otp || state.otp,
  };

  return (
    <View style={styles.container}>
      <SDUIRenderer
        definition={definition}
        state={mergedState}
        onAction={handleAction}
        onNavigate={handleNavigateFromRenderer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 12,
    color: '#999999',
    marginTop: 16,
  },
});