import cron from 'node-cron';
import { retryFailedNotifications } from '../src/services/notificationRetryService.js';

cron.schedule('*/5 * * * *', async () => {
  console.log('[Cron] Début retry notifications');
  try {
    await retryFailedNotifications();
    console.log('[Cron] Fin retry notifications');
  } catch (err) {
    console.error('❌ Erreur cron retry :', err);
  }
});
