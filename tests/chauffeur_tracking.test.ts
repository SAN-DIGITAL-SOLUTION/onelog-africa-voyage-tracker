import { insertTrackingPoint, getTrackingPoints } from '../src/services/chauffeurTracking';
import { supabase } from '../src/services/supabaseClient';

describe('Tracking Chauffeur', () => {
  it('insère un point de tracking et le récupère', async () => {
    // Remplacer par un missionId et un user authentifié valides en environnement de test
    const missionId = 'uuid-test-mission';
    const latitude = 5.3456;
    const longitude = -4.0123;

    // Insertion
    await insertTrackingPoint(missionId, latitude, longitude);
    // Récupération
    const points = await getTrackingPoints(missionId);

    expect(points).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ latitude, longitude })
      ])
    );
  });
});
