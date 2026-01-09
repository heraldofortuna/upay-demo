import layoutsData from '../config/layouts.json';

export interface LayoutComponent {
  type: string;
  props?: Record<string, any>;
  style?: Record<string, any> | string;
  children?: LayoutComponent[];
  condition?: string;
}

export interface ScreenLayout {
  enabled: boolean;
  components: LayoutComponent[];
}

export interface LayoutsConfig {
  screens: {
    [screenName: string]: ScreenLayout;
  };
}

class LayoutService {
  private layouts: LayoutsConfig;

  constructor() {
    this.layouts = layoutsData as LayoutsConfig;
  }

  /**
   * Obtiene el layout de una pantalla específica
   */
  getScreenLayout(screenName: string): ScreenLayout | null {
    const screenLayout = this.layouts.screens[screenName];
    if (!screenLayout) {
      console.warn(`Layout para pantalla "${screenName}" no encontrado`);
      return null;
    }
    return screenLayout;
  }

  /**
   * Verifica si una pantalla tiene layout dinámico habilitado
   */
  isLayoutEnabled(screenName: string): boolean {
    const layout = this.getScreenLayout(screenName);
    return layout?.enabled ?? false;
  }

  /**
   * Obtiene todos los layouts
   */
  getAllLayouts(): LayoutsConfig {
    return this.layouts;
  }

  /**
   * Obtiene los componentes de una pantalla
   */
  getScreenComponents(screenName: string): LayoutComponent[] {
    const layout = this.getScreenLayout(screenName);
    return layout?.components ?? [];
  }
}

export const layoutService = new LayoutService();
