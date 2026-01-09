/**
 * Wrapper para manejar actualizaciones OTA en la app
 * Se monta al inicio y verifica actualizaciones automáticamente
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useOTAUpdates } from '../hooks/useOTAUpdates';

interface OTAWrapperProps {
  children: React.ReactNode;
  autoCheck?: boolean;
  autoApply?: boolean;
}

export const OTAWrapper: React.FC<OTAWrapperProps> = ({
  children,
  autoCheck = true,
  autoApply = false,
}) => {
  // En desarrollo, deshabilitar OTA para evitar errores
  if (__DEV__) {
    console.log('🔧 OTAWrapper: Modo desarrollo, OTA deshabilitado');
    return <>{children}</>;
  }

  try {
    const { checkForUpdates, isChecking, updateInfo } = useOTAUpdates({
      autoCheck,
      autoApply,
      showAlert: false, // No mostrar alertas en desarrollo
      onUpdateAvailable: (info) => {
        console.log('📦 Actualización OTA disponible:', info);
      },
      onUpdateApplied: () => {
        console.log('✅ Actualización OTA aplicada');
      },
      onError: (error) => {
        console.error('❌ Error en actualización OTA:', error);
        // No bloquear la app por errores de OTA
      },
    });

    useEffect(() => {
      if (autoCheck) {
        checkForUpdates();
      }
    }, [autoCheck, checkForUpdates]);

    return <>{children}</>;
  } catch (error) {
    console.error('❌ Error en OTAWrapper:', error);
    // Si hay error, renderizar children de todas formas
    return <>{children}</>;
  }
};
