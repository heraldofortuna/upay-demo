/**
 * Error Boundary para capturar errores de renderizado
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary capturó un error:', error);
    console.error('❌ ErrorInfo:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>⚠️ Error</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'Ha ocurrido un error'}
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.stack}>{this.state.error.stack}</Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FF0000',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333333',
  },
  stack: {
    fontSize: 12,
    color: '#666666',
    marginTop: 16,
    fontFamily: 'monospace',
  },
});
