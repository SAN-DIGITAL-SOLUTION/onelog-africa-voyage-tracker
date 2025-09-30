// Script Node.js pour fallback notifications
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { retryUnconfirmedNotifications } = require('../src/services/notificationRetryService');

(async () => {
  try {
    await retryUnconfirmedNotifications();
    console.log('Fallback notifications vérifiées et traitées.');
    process.exit(0);
  } catch (e) {
    console.error('Erreur fallback notifications:', e);
    process.exit(1);
  }
})();
