/**
 * Servicio para manejar actualizaciones Over-The-Air (OTA)
 * Usa Expo Updates para descargar y aplicar actualizaciones sin pasar por las tiendas
 */

import * as Updates from 'expo-updates';

export interface UpdateInfo {
  isAvailable: boolean;
  manifest?: Updates.Manifest;
  isEmbeddedLaunch?: boolean;
}

class OTAService {
  /**
   * Verifica si hay actualizaciones disponibles
   */
  async checkForUpdates(): Promise<UpdateInfo> {
    try {
      if (!__DEV__ && Updates.isEnabled) {
        const update = await Updates.checkForUpdateAsync();
        return {
          isAvailable: update.isAvailable,
          manifest: update.manifest,
          isEmbeddedLaunch: update.isEmbeddedLaunch,
        };
      }
      return { isAvailable: false };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { isAvailable: false };
    }
  }

  /**
   * Descarga y aplica la actualización disponible
   */
  async downloadAndApplyUpdate(): Promise<boolean> {
    try {
      if (!__DEV__ && Updates.isEnabled) {
        const result = await Updates.fetchUpdateAsync();
        if (result.isNew) {
          // La actualización se aplicará en el próximo reinicio
          await Updates.reloadAsync();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error downloading update:', error);
      return false;
    }
  }

  /**
   * Obtiene información sobre la actualización actual
   */
  getUpdateInfo(): {
    updateId?: string;
    createdAt?: Date;
    runtimeVersion?: string;
    channel?: string;
  } {
    try {
      if (Updates.updateId) {
        return {
          updateId: Updates.updateId,
          createdAt: Updates.createdAt,
          runtimeVersion: Updates.runtimeVersion,
          channel: Updates.channel,
        };
      }
      return {};
    } catch (error) {
      console.error('Error getting update info:', error);
      return {};
    }
  }

  /**
   * Verifica si las actualizaciones OTA están habilitadas
   */
  isOTAEnabled(): boolean {
    return Updates.isEnabled;
  }

  /**
   * Obtiene el canal de actualización actual
   */
  getChannel(): string | null {
    try {
      return Updates.channel || null;
    } catch {
      return null;
    }
  }

  /**
   * Verifica y aplica actualizaciones automáticamente
   * Útil para llamar al inicio de la app
   */
  async checkAndApplyUpdates(): Promise<boolean> {
    try {
      const updateInfo = await this.checkForUpdates();
      if (updateInfo.isAvailable) {
        console.log('📦 Nueva actualización disponible, descargando...');
        return await this.downloadAndApplyUpdate();
      }
      return false;
    } catch (error) {
      console.error('Error in checkAndApplyUpdates:', error);
      return false;
    }
  }
}

export const otaService = new OTAService();
