import React from "react";

export default function SuccessModal({ demande }: { demande: any }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
        <h2 className="text-xl font-semibold mb-2">Demande envoyée !</h2>
        <p className="mb-4">Votre demande a bien été prise en compte.</p>
        {demande?.trackingId && (
          <div className="mb-2">
            <span className="font-semibold">Lien de suivi :</span>
            <div className="break-all text-blue-600">
              {window.location.origin + "/suivi/" + demande.trackingId}
            </div>
          </div>
        )}
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Nouvelle demande
        </button>
      </div>
    </div>
  );
}
