// Utility functions for transforming data between frontend camelCase and backend snake_case

export function transformToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively transform nested objects
      result[snakeKey] = transformToSnakeCase(value);
    } else if (Array.isArray(value)) {
      // Handle arrays
      result[snakeKey] = value.map(item =>
        typeof item === 'object' && item !== null ? transformToSnakeCase(item) : item
      );
    } else {
      result[snakeKey] = value;
    }
  }

  return result;
}

export function transformToCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively transform nested objects
      result[camelKey] = transformToCamelCase(value);
    } else if (Array.isArray(value)) {
      // Handle arrays
      result[camelKey] = value.map(item =>
        typeof item === 'object' && item !== null ? transformToCamelCase(item) : item
      );
    } else {
      result[camelKey] = value;
    }
  }

  return result;
}

// Specific transformation for conference data
export function transformConferenceData(data: any) {
  return {
    name: data.name,
    city: data.city,
    description: data.description,
    startsAtUtc: data.startsAtUtc,
    endsAtUtc: data.endsAtUtc,
    websiteUrl: data.websiteUrl || null,
    programUrl: data.programUrl || null,
    hotelMapUrl: data.hotelMapUrl || null,
    flyerUrl: data.flyerUrl || null,
    imageUrls: data.imageUrls || [],
    status: 'pending',
  };
}
