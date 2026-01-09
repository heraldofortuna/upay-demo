/**
 * Hook para manejar actualizaciones OTA en componentes React
 */

import { useEffect, useState, useCallback } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { otaService, UpdateInfo } from '../services/otaService';

interface UseOTAUpdatesOptions {
  autoCheck?: boolean;
  autoApply?: boolean;
  showAlert?: boolean;
  onUpdateAvailable?: (info: UpdateInfo) => void;
  onUpdateApplied?: () => void;
  onError?: (error: Error) => void;
}

export const useOTAUpdates = (options: UseOTAUpdatesOptions = {}) => {
  const {
    autoCheck = true,
    autoApply = false,
    showAlert = true,
    onUpdateAvailable,
    onUpdateApplied,
    onError,
  } = options;

  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const checkForUpdates = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const info = await otaService.checkForUpdates();
      setUpdateInfo(info);
      
      if (info.isAvailable) {
        onUpdateAvailable?.(info);
        
        if (showAlert) {
          Alert.alert(
            'Actualización Disponible',
            'Hay una nueva versión disponible. ¿Deseas descargarla ahora?',
            [
              {
                text: 'Más tarde',
                style: 'cancel',
              },
              {
                text: 'Descargar',
                onPress: async () => {
                  await applyUpdate();
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, showAlert, onUpdateAvailable, onError]);

  const applyUpdate = useCallback(async () => {
    if (isApplying) return;
    
    setIsApplying(true);
    try {
      const applied = await otaService.downloadAndApplyUpdate();
      if (applied) {
        onUpdateApplied?.();
        if (showAlert) {
          Alert.alert(
            'Actualización Aplicada',
            'La actualización se aplicará al reiniciar la aplicación.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
    } finally {
      setIsApplying(false);
    }
  }, [isApplying, showAlert, onUpdateApplied, onError]);

  // Verificar actualizaciones al montar el componente
  useEffect(() => {
    if (autoCheck && otaService.isOTAEnabled()) {
      checkForUpdates();
    }
  }, [autoCheck, checkForUpdates]);

  // Verificar actualizaciones cuando la app vuelve al foreground
  useEffect(() => {
    if (!autoCheck) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && otaService.isOTAEnabled()) {
        checkForUpdates();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [autoCheck, checkForUpdates]);

  // Aplicar actualizaciones automáticamente si está habilitado
  useEffect(() => {
    if (autoApply && updateInfo?.isAvailable) {
      applyUpdate();
    }
  }, [autoApply, updateInfo, applyUpdate]);

  return {
    isChecking,
    isApplying,
    updateInfo,
    checkForUpdates,
    applyUpdate,
    updateInfo: otaService.getUpdateInfo(),
    isOTAEnabled: otaService.isOTAEnabled(),
  };
};
