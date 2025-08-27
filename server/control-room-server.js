const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Configuration Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes REST

// Obtenir toutes les positions d'un transporteur
app.get('/api/positions/:transporteurId', async (req, res) => {
  try {
    const { transporteurId } = req.params;
    
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('transporteur_id', transporteurId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erreur récupération positions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtenir la dernière position par véhicule
app.get('/api/positions/:transporteurId/latest', async (req, res) => {
  try {
    const { transporteurId } = req.params;
    
    const { data, error } = await supabase
      .rpc('get_latest_positions', { transporteur_uuid: transporteurId });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erreur récupération dernières positions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ajouter une nouvelle position
app.post('/api/positions', async (req, res) => {
  try {
    const position = req.body;
    
    const { data, error } = await supabase
      .from('positions')
      .insert([position])
      .select()
      .single();

    if (error) throw error;
    
    // Émettre l'événement via WebSocket
    io.emit('position_update', data);
    
    res.json(data);
  } catch (error) {
    console.error('Erreur insertion position:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket pour temps réel
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('join_transporteur', (transporteurId) => {
    socket.join(`transporteur_${transporteurId}`);
    console.log(`Client ${socket.id} rejoint transporteur ${transporteurId}`);
  });

  socket.on('leave_transporteur', (transporteurId) => {
    socket.leave(`transporteur_${transporteurId}`);
    console.log(`Client ${socket.id} quitté transporteur ${transporteurId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Écouter les changements Supabase Realtime
const channel = supabase
  .channel('positions_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'positions' },
    (payload) => {
      console.log('Changement détecté:', payload);
      
      // Émettre aux clients du transporteur concerné
      const transporteurId = payload.new?.transporteur_id || payload.old?.transporteur_id;
      if (transporteurId) {
        io.to(`transporteur_${transporteurId}`).emit('position_update', payload.new);
      }
    }
  )
  .subscribe();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur Control Room démarré sur le port ${PORT}`);
});
