/**
 * Motor de renderizado Server-Driven UI (SDUI)
 * Renderiza componentes React Native basándose en definiciones del servidor
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button } from '../components';
import { Loader } from '../components';

export interface SDUIDefinition {
  id: string;
  type: string;
  layout: SDUIComponent;
  actions?: any[];
  hooks?: any[];
}

export interface SDUIComponent {
  type: string;
  style?: ViewStyle | TextStyle;
  props?: any;
  children?: SDUIComponent[];
  condition?: any;
  [key: string]: any;
}

interface SDUIRendererProps {
  definition: SDUIDefinition;
  state?: Record<string, any>;
  onAction?: (action: any) => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export const SDUIRenderer: React.FC<SDUIRendererProps> = ({
  definition,
  state = {},
  onAction,
  onNavigate,
}) => {
  React.useEffect(() => {
    console.log('[SDUIRenderer] Rendering definition:', definition?.id);
    console.log('[SDUIRenderer] State:', state);
  }, [definition?.id, state]);

  const renderComponent = (component: SDUIComponent): React.ReactNode => {
    if (!component) {
      console.warn('[SDUIRenderer] Component is null or undefined');
      return null;
    }

    // Evaluar condiciones
    if (component.condition) {
      const shouldRender = evaluateCondition(component.condition, state);
      if (!shouldRender) return null;
    }

    switch (component.type) {
      case 'container':
        return renderContainer(component);
      case 'text':
        return renderText(component);
      case 'button':
        return renderButton(component, onAction, onNavigate);
      case 'loader':
        return renderLoader(component);
      default:
        console.warn(`Component type ${component.type} not supported`);
        return null;
    }
  };

  const renderContainer = (component: SDUIComponent): React.ReactNode => {
    const { style, children, props } = component;
    const mergedStyle = { ...style, ...props?.style };

    // Los children pueden estar directamente o dentro de props
    const containerChildren = children || props?.children || [];
    
    console.log('[SDUIRenderer] Rendering container with', containerChildren?.length || 0, 'children');

    const renderedChildren = containerChildren?.map((child: SDUIComponent, index: number) => {
      const rendered = renderComponent(child);
      if (!rendered) {
        console.warn('[SDUIRenderer] Child', index, 'did not render:', child?.type);
      }
      return (
        <React.Fragment key={child.id || `child-${index}`}>
          {rendered}
        </React.Fragment>
      );
    });

    return (
      <View key={component.id || `container-${Math.random()}`} style={mergedStyle}>
        {renderedChildren}
      </View>
    );
  };

  const renderText = (component: SDUIComponent): React.ReactNode => {
    const { props, style } = component;
    const text = interpolateString(props?.text || '', state);

    // Aplicar condiciones de texto
    let displayText = text;
    if (props?.condition) {
      const condition = evaluateCondition(props.condition, state);
      if (condition) {
        displayText = interpolateString(condition.then?.text || text, state);
      } else {
        displayText = interpolateString(condition.else?.text || text, state);
      }
    }

    const mergedStyle = { ...style, ...props?.style };

    console.log('[SDUIRenderer] Rendering text:', displayText.substring(0, 50));

    return (
      <Text key={component.id || `text-${Math.random()}`} style={mergedStyle}>
        {displayText}
      </Text>
    );
  };

  const renderButton = (
    component: SDUIComponent,
    onAction?: (action: any) => void,
    onNavigate?: (screen: string, params?: any) => void
  ): React.ReactNode => {
    const { props, style } = component;
    const title = interpolateString(props?.title || '', state);

    const handlePress = () => {
      const action = props?.onPress;
      if (action?.type === 'navigate' && onNavigate) {
        const params = action.params
          ? interpolateObject(action.params, state)
          : undefined;
        onNavigate(action.screen, params);
      } else if (action?.type === 'api_call' && onAction) {
        onAction(action);
      } else if (onAction) {
        onAction(action);
      }
    };

    const isDisabled = props?.disabled
      ? evaluateCondition(props.disabled, state)
      : false;

    const isLoading =
      props?.loading === true || interpolateString(props?.loading || '', state) === 'true';

    const mergedStyle = { ...style, ...props?.style };

    return (
      <Button
        key={component.id || Math.random()}
        title={title}
        onPress={handlePress}
        variant={props?.variant || 'primary'}
        disabled={isDisabled}
        loading={isLoading}
        style={mergedStyle}
      />
    );
  };

  const renderLoader = (component: SDUIComponent): React.ReactNode => {
    const { props } = component;
    return (
      <Loader
        key={component.id || Math.random()}
        size={props?.size || 'large'}
        text={props?.text}
      />
    );
  };

  // Evaluar condiciones
  const evaluateCondition = (condition: any, state: Record<string, any>): boolean => {
    if (typeof condition === 'boolean') return condition;
    if (typeof condition === 'object' && condition !== null) {
      const { field, operator, value } = condition;
      const fieldValue = getNestedValue(state, field);

      switch (operator) {
        case 'equals':
          return fieldValue === value;
        case 'notEquals':
          return fieldValue !== value;
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

  // Interpolar strings con {{variables}}
  const interpolateString = (str: string, state: Record<string, any>): string => {
    if (typeof str !== 'string') return String(str);
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = getNestedValue(state, key);
      return value !== undefined && value !== null ? String(value) : match;
    });
  };

  // Interpolar objetos
  const interpolateObject = (
    obj: any,
    state: Record<string, any>
  ): Record<string, any> => {
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

  // Obtener valor anidado usando notación de punto
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

  if (!definition || !definition.layout) {
    console.error('[SDUIRenderer] Invalid definition or layout');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, color: '#FF3B30' }}>
          Error: Definición de pantalla inválida
        </Text>
      </View>
    );
  }

  const rendered = renderComponent(definition.layout);
  
  if (!rendered) {
    console.warn('[SDUIRenderer] No content rendered');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, color: '#666666' }}>
          No hay contenido para mostrar
        </Text>
      </View>
    );
  }

  return <>{rendered}</>;
};