// Types pour les templates de notification
type NotificationType = 'mission_created' | 'mission_updated' | 'payment_received' | 'delivery_status';

type TemplateVariables = {
  [key: string]: string | number | Date;
};

// Templates pour les notifications
export const notificationTemplates = {
  // Notification de création de mission
  mission_created: (vars: TemplateVariables) => ({
    subject: 'Nouvelle mission créée',
    message: `Bonjour {clientName}, votre mission #{missionId} a été créée avec succès. Date de livraison prévue : {deliveryDate}.`,
    whatsapp: `🚚 Nouvelle mission #*{missionId}* créée pour {clientName}. Livraison prévue le *{deliveryDate}*.`,
    sms: `Nouvelle mission #{missionId} créée. Livraison prévue le {deliveryDate}.`
  }),

  // Notification de mise à jour de mission
  mission_updated: (vars: TemplateVariables) => ({
    subject: 'Mise à jour de mission',
    message: `Bonjour {clientName}, votre mission #{missionId} a été mise à jour. Statut : {status}.`,
    whatsapp: `🔄 Mission #*{missionId}* mise à jour. Statut : *{status}*`,
    sms: `Mission #{missionId} mise à jour. Statut : {status}.`
  }),

  // Notification de paiement reçu
  payment_received: (vars: TemplateVariables) => ({
    subject: 'Paiement reçu',
    message: `Bonjour {clientName}, nous avons bien reçu votre paiement de {amount} {currency} pour la mission #{missionId}.`,
    whatsapp: `💰 Paiement de *{amount} {currency}* reçu pour la mission #*{missionId}*. Merci !`,
    sms: `Paiement de {amount} {currency} reçu pour la mission #{missionId}.`
  }),

  // Notification de statut de livraison
  delivery_status: (vars: TemplateVariables) => ({
    subject: 'Mise à jour de livraison',
    message: `Bonjour {clientName}, le statut de votre livraison pour la mission #{missionId} est maintenant : {status}.`,
    whatsapp: `📦 Statut de livraison #*{missionId}* : *{status}*`,
    sms: `Livraison #{missionId} : {status}.`
  })
} as const;

// Fonction utilitaire pour remplacer les variables dans les templates
const replaceVariables = (template: string, vars: TemplateVariables): string => {
  return Object.entries(vars).reduce(
    (result, [key, value]) => {
      const formattedValue = value instanceof Date 
        ? value.toLocaleDateString('fr-FR') 
        : String(value);
      return result.replace(new RegExp(`{${key}}`, 'g'), formattedValue);
    },
    template
  );
};

// Fonction pour obtenir un template formaté
export const getNotificationTemplate = (
  type: NotificationType,
  channel: 'email' | 'whatsapp' | 'sms',
  variables: TemplateVariables
): string => {
  const template = notificationTemplates[type](variables);
  return replaceVariables(template[channel] || template.message, variables);
};
