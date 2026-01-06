# Integración NFC con Dispositivos POS

## Estado Actual

La aplicación incluye un sistema de detección NFC simulado que funciona para desarrollo y testing. Para producción, necesitarás integrar con el hardware real del POS.

## Opciones de Integración

### Opción 1: react-native-nfc-manager

Para dispositivos Android/iOS estándar con NFC:

```bash
npm install react-native-nfc-manager
```

Luego actualiza `src/hooks/useNfcDetection.ts`:

```typescript
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

// En el hook:
const detectNfc = async () => {
  try {
    await NfcManager.start();
    const tech = await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    const ndefMessage = tag.ndefMessage;
    
    if (ndefMessage && ndefMessage.length > 0) {
      const cardData = parseCardData(ndefMessage);
      onCardDetected(cardData);
    }
  } catch (ex) {
    console.error('Error leyendo NFC:', ex);
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
};
```

### Opción 2: SDK del Fabricante del POS

Muchos dispositivos POS tienen SDKs específicos. Consulta la documentación de tu fabricante:

- **PAX**: PAX A920, A920 Pro tienen SDKs propios
- **Ingenico**: iWL series, Move series
- **Verifone**: VX series
- **Square**: Square Reader SDK

Ejemplo genérico:

```typescript
// Importar SDK del fabricante
import { PosNfcManager } from '@vendor/pos-sdk';

// Configurar listener
PosNfcManager.onCardDetected((cardData) => {
  onCardDetected({
    cardNumber: cardData.maskedNumber,
    cardType: cardData.type,
    expiryDate: cardData.expiryDate,
    holderName: cardData.holderName,
  });
});

// Iniciar detección
PosNfcManager.startDetection();
```

### Opción 3: Eventos Nativos Android

Para integración directa con Android:

```typescript
import { NativeModules, NativeEventEmitter } from 'react-native';

const { PosNfcModule } = NativeModules;
const nfcEmitter = new NativeEventEmitter(PosNfcModule);

useEffect(() => {
  const subscription = nfcEmitter.addListener('CardDetected', (cardData) => {
    onCardDetected(cardData);
  });

  PosNfcModule.startNfcDetection();

  return () => {
    subscription.remove();
    PosNfcModule.stopNfcDetection();
  };
}, []);
```

### Opción 4: Broadcast Receivers (Android)

Para dispositivos que emiten broadcasts cuando detectan tarjetas:

```java
// En tu módulo nativo Android
public class NfcReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    String action = intent.getAction();
    if ("com.pos.CARD_DETECTED".equals(action)) {
      // Enviar evento a React Native
      WritableMap params = Arguments.createMap();
      params.putString("cardNumber", intent.getStringExtra("cardNumber"));
      // ...
      sendEvent("CardDetected", params);
    }
  }
}
```

## Implementación Recomendada

1. **Identifica el modelo de tu POS**: Consulta el fabricante para el SDK específico
2. **Instala la biblioteca/SDK apropiada**
3. **Actualiza `useNfcDetection.ts`** con la implementación real
4. **Prueba en dispositivo real** antes de desplegar a producción
5. **Maneja errores** apropiadamente (tarjetas no soportadas, NFC desactivado, etc.)

## Testing

Mientras desarrollas, puedes usar:
- El botón de simulación en modo desarrollo (ya implementado)
- Tarjetas de prueba del procesador de pagos
- Emuladores de tarjetas NFC (si tu dispositivo lo soporta)

## Notas de Seguridad

- **Nunca** almacenes datos de tarjeta en texto plano
- Usa encriptación para datos sensibles
- Cumple con PCI DSS si manejas datos de tarjetas
- Considera usar tokens en lugar de números de tarjeta reales
