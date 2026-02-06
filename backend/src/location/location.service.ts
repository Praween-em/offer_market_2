import { Injectable } from '@nestjs/common';

@Injectable()
export class LocationService {
    /**
     * Calculate distance between two points using Haversine formula
     * @param lat1 Latitude of point 1
     * @param lon1 Longitude of point 1
     * @param lat2 Latitude of point 2
     * @param lon2 Longitude of point 2
     * @returns Distance in kilometers
     */
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
            Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance * 10) / 10; // Round to 1 decimal place
    }

    /**
     * Check if two points are within a specified radius
     * @param lat1 Latitude of point 1
     * @param lon1 Longitude of point 1
     * @param lat2 Latitude of point 2
     * @param lon2 Longitude of point 2
     * @param radiusKm Radius in kilometers
     * @returns true if within radius, false otherwise
     */
    isWithinRadius(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
        radiusKm: number,
    ): boolean {
        const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
        return distance <= radiusKm;
    }

    /**
     * Convert degrees to radians
     */
    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Optional: Reverse geocode coordinates to get location name
     * Uses Nominatim (OpenStreetMap) - free but rate limited
     * Results should be cached to avoid hitting rate limits
     */
    async reverseGeocode(lat: number, lng: number): Promise<string | null> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': process.env.NOMINATIM_USER_AGENT || 'OfferMarket/1.0',
                    },
                },
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            // Extract locality/suburb and city
            const address = data.address || {};
            const locality = address.suburb || address.neighbourhood || address.locality;
            const city = address.city || address.town || address.village;

            if (locality && city) {
                return `${locality}, ${city}`;
            } else if (city) {
                return city;
            }

            return data.display_name || null;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    }
}
