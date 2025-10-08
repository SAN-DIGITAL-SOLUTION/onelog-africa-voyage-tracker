const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Config Supabase avec clé privée
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://fhiegxnqgjlgpbywujzo.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key'
);

// Endpoint pour mettre à jour les positions
app.post('/positions/update', async (req, res) => {
  try {
    const { vehicle_id, latitude, longitude } = req.body;

    if (!vehicle_id || !latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Données manquantes: vehicle_id, latitude et longitude requis' 
      });
    }

    // Validation des coordonnées
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Coordonnées invalides' 
      });
    }

    // Insérer nouvelle position
    const { data, error } = await supabase
      .from('positions')
      .insert([{ vehicle_id, latitude, longitude }])
      .select('*')
      .single();

    if (error) throw error;

    // Nettoyer anciennes positions (garder 50 dernières par véhicule)
    const { data: recentPositions } = await supabase
      .from('positions')
      .select('id')
      .eq('vehicle_id', vehicle_id)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (recentPositions && recentPositions.length === 50) {
      const idsToKeep = recentPositions.map(p => p.id);
      await supabase
        .from('positions')
        .delete()
        .eq('vehicle_id', vehicle_id)
        .not('id', 'in', `(${idsToKeep.join(',')})`);
    }

    res.json({
      success: true,
      data,
      message: 'Position enregistrée avec succès'
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

// Endpoint pour récupérer les dernières positions
app.get('/positions/latest', async (req, res) => {
  try {
    const { vehicle_id } = req.query;
    
    let query = supabase
      .from('positions')
      .select('id, vehicle_id, latitude, longitude, timestamp')
      .order('timestamp', { ascending: false });

    if (vehicle_id) {
      query = query.eq('vehicle_id', vehicle_id);
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Garder seulement la dernière position par véhicule
    const latestPositions = data.reduce((acc, pos) => {
      if (!acc[pos.vehicle_id] || new Date(pos.timestamp) > new Date(acc[pos.vehicle_id].timestamp)) {
        acc[pos.vehicle_id] = pos;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(latestPositions),
      count: Object.keys(latestPositions).length
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend OneLog tracking démarré sur http://localhost:${PORT}`);
  console.log(`📍 POST /positions/update - Mettre à jour une position`);
  console.log(`📍 GET /positions/latest - Récupérer les dernières positions`);
});

module.exports = app;
