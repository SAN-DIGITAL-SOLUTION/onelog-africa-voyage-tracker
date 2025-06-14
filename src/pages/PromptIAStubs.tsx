
// Stubs de prompts IA pour OneLog Africa — À brancher plus tard dans les modules concernés

/**
 * Prompt géocodage adresse → lat/lon
 * @param adresse string
 */
export function geocodePrompt(adresse: string) {
  return `Convertis cette adresse en coordonnées GPS (latitude, longitude) précises : "${adresse}"`;
}

/**
 * Prompt estimation prix de mission
 * @param data : { distanceKm: number, points: any }
 */
export function estimatePricePrompt(data: { distanceKm: number, points?: any }) {
  return `Estime le prix d’une course sur ${data.distanceKm} km. Fournir une fourchette FCFA.`;
}

/**
 * Prompt suggestion d’itinéraire optimisé
 * @param missions array
 */
export function optimizedItineraryPrompt(missions: any[]) {
  return `Propose le meilleur itinéraire pour optimiser la tournée de ces missions : ${JSON.stringify(
    missions
  )}`;
}
