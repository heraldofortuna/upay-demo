import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LayoutComponent } from '../services/layoutService';
import { Button } from './Button/Button';
import { Loader } from './Loader/Loader';
import { textService } from '../services/textService';

export interface OTARendererProps {
  layout: LayoutComponent[];
  state?: Record<string, any>;
  handlers?: Record<string, () => void>;
  styles?: Record<string, ViewStyle | TextStyle>;
}

/**
 * Renderizador dinámico para OTA que construye UI desde JSON
 */
export const OTARenderer: React.FC<OTARendererProps> = ({
  layout,
  state = {},
  handlers = {},
  styles: customStyles = {},
}) => {
  /**
   * Evalúa una expresión de template (ej: "{{texts.title}}")
   */
  const evaluateTemplate = (template: string): any => {
    if (typeof template !== 'string' || !template.includes('{{')) {
      return template;
    }

    try {
      // Reemplazar referencias a textos
      let evaluated = template.replace(/\{\{texts\.(\w+)\}\}/g, (match, key) => {
        // Intentar obtener el texto desde el contexto actual
        const screenName = state._screenName || '';
        if (screenName) {
          const screenTexts = textService.getScreenTexts(screenName as any);
          return (screenTexts as any)[key] || match;
        }
        return match;
      });

      // Reemplazar referencias al estado
      evaluated = evaluated.replace(/\{\{state\.(\w+)\}\}/g, (match, key) => {
        return state[key] !== undefined ? String(state[key]) : match;
      });

      // Evaluar expresiones condicionales simples
      evaluated = evaluated.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
        try {
          // Reemplazar referencias en la expresión
          let exprEvaluated = expr
            .replace(/state\.(\w+)/g, (m, key) => {
              const value = state[key];
              if (value === undefined || value === null) return 'undefined';
              if (typeof value === 'string') return `"${value}"`;
              return String(value);
            })
            .replace(/texts\.(\w+)/g, (m, key) => {
              const screenName = state._screenName || '';
              if (screenName) {
                const screenTexts = textService.getScreenTexts(screenName as any);
                const value = (screenTexts as any)[key];
                return value ? `"${value}"` : 'undefined';
              }
              return 'undefined';
            });

          // Evaluar expresión simple (solo operadores básicos)
          if (exprEvaluated.includes('?')) {
            // Operador ternario
            const parts = exprEvaluated.split('?');
            const condition = parts[0].trim();
            const rest = parts[1];
            const [trueValue, falseValue] = rest.split(':').map(s => s.trim());
            
            const conditionResult = evaluateCondition(condition);
            return conditionResult ? trueValue.replace(/"/g, '') : falseValue.replace(/"/g, '');
          }

          return String(eval(exprEvaluated));
        } catch (e) {
          console.warn('Error evaluando expresión:', expr, e);
          return match;
        }
      });

      return evaluated;
    } catch (error) {
      console.warn('Error evaluando template:', template, error);
      return template;
    }
  };

  /**
   * Evalúa una condición simple
   */
  const evaluateCondition = (condition: string): boolean => {
    try {
      // Reemplazar referencias
      let evaluated = condition
        .replace(/state\.(\w+)/g, (m, key) => {
          const value = state[key];
          if (value === undefined || value === null) return 'undefined';
          if (typeof value === 'string') return `"${value}"`;
          if (typeof value === 'boolean') return String(value);
          return String(value);
        })
        .replace(/texts\.(\w+)/g, (m, key) => {
          const screenName = state._screenName || '';
          if (screenName) {
            const screenTexts = textService.getScreenTexts(screenName as any);
            const value = (screenTexts as any)[key];
            return value ? `"${value}"` : 'undefined';
          }
          return 'undefined';
        });

      // Evaluar condición
      return Boolean(eval(evaluated));
    } catch (error) {
      console.warn('Error evaluando condición:', condition, error);
      return true; // Por defecto mostrar si hay error
    }
  };

  /**
   * Obtiene estilos combinando estilos base y personalizados
   */
  const getStyles = (styleKey?: string | Record<string, any>): ViewStyle | TextStyle => {
    if (!styleKey) return {};
    
    if (typeof styleKey === 'object') {
      return styleKey as ViewStyle;
    }

    if (typeof styleKey === 'string') {
      // Buscar en estilos personalizados primero
      if (customStyles[styleKey]) {
        return customStyles[styleKey] as ViewStyle;
      }
      // Buscar en estilos predefinidos
      if (defaultStyles[styleKey]) {
        return defaultStyles[styleKey] as ViewStyle;
      }
    }

    return {};
  };

  /**
   * Renderiza un componente individual
   */
  const renderComponent = (component: LayoutComponent, index: number): React.ReactNode => {
    // Verificar condición si existe
    if (component.condition) {
      const shouldRender = evaluateCondition(component.condition);
      if (!shouldRender) {
        return null;
      }
    }

    const { type, props = {}, style, children } = component;

    switch (type) {
      case 'View': {
        const viewStyle = getStyles(style || props.style);
        return (
          <View key={index} style={viewStyle}>
            {children?.map((child, idx) => renderComponent(child, idx))}
          </View>
        );
      }

      case 'Text': {
        const textStyle = getStyles(style || props.style);
        const text = evaluateTemplate(props.text || '');
        return (
          <Text key={index} style={textStyle}>
            {text}
          </Text>
        );
      }

      case 'Button': {
        const buttonStyle = getStyles(style || props.style);
        const title = evaluateTemplate(props.title || '');
        const onPress = props.onPress && handlers[props.onPress] ? handlers[props.onPress] : undefined;
        const disabled = props.disabled ? evaluateTemplate(String(props.disabled)) === 'true' : false;
        const variant = props.variant || 'primary';

        return (
          <Button
            key={index}
            title={title}
            onPress={onPress || (() => {})}
            variant={variant}
            disabled={disabled}
            style={buttonStyle}
          />
        );
      }

      case 'Loader': {
        const loaderStyle = getStyles(style || props.style);
        const text = evaluateTemplate(props.text || '');
        return (
          <View key={index} style={loaderStyle}>
            <Loader text={text} />
          </View>
        );
      }

      default:
        console.warn(`Tipo de componente desconocido: ${type}`);
        return null;
    }
  };

  return (
    <>
      {layout.map((component, index) => renderComponent(component, index))}
    </>
  );
};

/**
 * Estilos predefinidos para componentes comunes
 */
const defaultStyles: Record<string, ViewStyle | TextStyle> = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 24,
  },
  otp: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 8,
    marginBottom: 16,
  },
  timer: {
    fontSize: 14,
    color: '#999999',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loaderText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
  },
  cardInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 12,
  },
  cardLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
};
