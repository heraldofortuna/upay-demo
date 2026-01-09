/**
 * Utilidades para manipular definiciones de pantallas
 */

/**
 * Busca y reemplaza texto en una definición recursivamente
 */
export function findAndReplaceText(definition, searchText, replaceText) {
  if (!definition || typeof definition !== 'object') {
    return definition;
  }
  
  const result = Array.isArray(definition) ? [...definition] : { ...definition };
  
  for (const key in result) {
    if (key === 'text' && typeof result[key] === 'string') {
      // Reemplazar texto
      result[key] = result[key].replace(new RegExp(searchText, 'gi'), replaceText);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Recursión para objetos anidados
      result[key] = findAndReplaceText(result[key], searchText, replaceText);
    }
  }
  
  return result;
}

/**
 * Busca todos los textos en una definición
 */
export function findAllTexts(definition, texts = []) {
  if (!definition || typeof definition !== 'object') {
    return texts;
  }
  
  for (const key in definition) {
    if (key === 'text' && typeof definition[key] === 'string') {
      texts.push({
        path: key,
        value: definition[key],
      });
    } else if (typeof definition[key] === 'object' && definition[key] !== null) {
      findAllTexts(definition[key], texts);
    }
  }
  
  return texts;
}

/**
 * Actualiza un texto específico por su path
 */
export function updateTextByPath(definition, path, newText) {
  const pathParts = path.split('.');
  let current = definition;
  
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!current[pathParts[i]]) {
      throw new Error(`Path inválido: ${path}`);
    }
    current = current[pathParts[i]];
  }
  
  const lastKey = pathParts[pathParts.length - 1];
  if (current[lastKey] !== undefined) {
    current[lastKey] = newText;
  } else {
    throw new Error(`Path inválido: ${path}`);
  }
  
  return definition;
}

/**
 * Busca un componente por tipo en la definición
 */
export function findComponentsByType(definition, type, components = []) {
  if (!definition || typeof definition !== 'object') {
    return components;
  }
  
  if (definition.type === type) {
    components.push(definition);
  }
  
  const children = definition.children || definition.props?.children || [];
  if (Array.isArray(children)) {
    children.forEach(child => {
      findComponentsByType(child, type, components);
    });
  }
  
  return components;
}

/**
 * Valida estructura básica de una definición
 */
export function validateDefinition(definition) {
  const errors = [];
  
  if (!definition) {
    errors.push('Definición no puede estar vacía');
    return errors;
  }
  
  if (!definition.layout) {
    errors.push('Debe incluir "layout"');
  }
  
  if (definition.layout && !definition.layout.type) {
    errors.push('Layout debe tener un "type"');
  }
  
  return errors;
}