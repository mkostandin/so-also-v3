/**
 * Geolocation utilities for converting addresses to coordinates
 * Supports multiple geocoding providers with fallbacks
 */

interface GeocodeResult {
  latitude: number;
  longitude: number;
  confidence?: number;
  provider: string;
}

interface GeocodeError {
  message: string;
  provider: string;
  fallbackUsed?: boolean;
}

class GeolocationService {
  private mapboxToken?: string;
  private readonly defaultCoordinates = {
    // Derry, NH as fallback (project default)
    latitude: 42.8806,
    longitude: -71.3290
  };

  constructor() {
    this.mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  }

  /**
   * Geocode an address to coordinates
   * Uses MapBox if available, falls back to OpenStreetMap Nominatim
   */
  async geocodeAddress(
    address: string,
    city?: string,
    state?: string,
    postal?: string,
    country?: string
  ): Promise<GeocodeResult | null> {
    // Build full address string
    const fullAddress = this.buildAddressString(address, city, state, postal, country);

    if (!fullAddress.trim()) {
      console.warn('Empty address provided for geocoding');
      return null;
    }

    // Try MapBox first if token is available
    if (this.mapboxToken) {
      try {
        const result = await this.geocodeWithMapBox(fullAddress);
        if (result) {
          return result;
        }
      } catch (error) {
        console.warn('MapBox geocoding failed:', error);
      }
    }

    // Fallback to Nominatim (OpenStreetMap)
    try {
      const result = await this.geocodeWithNominatim(fullAddress);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn('Nominatim geocoding failed:', error);
    }

    // Final fallback to default coordinates
    console.log('All geocoding services failed, using default coordinates');
    return {
      latitude: this.defaultCoordinates.latitude,
      longitude: this.defaultCoordinates.longitude,
      confidence: 0,
      provider: 'default'
    };
  }

  /**
   * Build address string from components
   */
  private buildAddressString(
    address?: string,
    city?: string,
    state?: string,
    postal?: string,
    country?: string
  ): string {
    const parts = [];

    if (address) parts.push(address);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (postal) parts.push(postal);
    if (country && country !== 'USA') parts.push(country);

    return parts.join(', ');
  }

  /**
   * Geocode using MapBox API
   */
  private async geocodeWithMapBox(address: string): Promise<GeocodeResult | null> {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${this.mapboxToken}&limit=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`MapBox API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;

      return {
        latitude,
        longitude,
        confidence: feature.relevance || 0.5,
        provider: 'mapbox'
      };
    }

    return null;
  }

  /**
   * Geocode using OpenStreetMap Nominatim API (free, no API key required)
   */
  private async geocodeWithNominatim(address: string): Promise<GeocodeResult | null> {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&countrycodes=us`;

    // Add User-Agent header as required by Nominatim
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Volo-App-Geocoding/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        confidence: 0.7, // Nominatim doesn't provide confidence scores
        provider: 'nominatim'
      };
    }

    return null;
  }

  /**
   * Validate coordinates are reasonable (within US bounds roughly)
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    // Rough bounds for continental US + some padding
    return latitude >= 24 && latitude <= 50 && longitude >= -130 && longitude <= -65;
  }

  /**
   * Get fallback coordinates for a given region/state
   */
  getRegionalFallback(state?: string): { latitude: number; longitude: number } {
    const stateCoordinates: Record<string, { latitude: number; longitude: number }> = {
      'MA': { latitude: 42.3601, longitude: -71.0589 }, // Boston
      'RI': { latitude: 41.8240, longitude: -71.4128 }, // Providence
      'CT': { latitude: 41.7658, longitude: -72.6734 }, // Hartford
      'NH': { latitude: 43.2081, longitude: -71.5376 }, // Concord
      'VT': { latitude: 44.2601, longitude: -72.5754 }, // Montpelier
      'ME': { latitude: 44.3106, longitude: -69.7795 }, // Augusta
    };

    if (state && stateCoordinates[state]) {
      return stateCoordinates[state];
    }

    // Default to Derry, NH
    return this.defaultCoordinates;
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
export default geolocationService;
