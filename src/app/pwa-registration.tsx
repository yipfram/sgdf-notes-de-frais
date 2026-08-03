"use client";

import { useEffect } from "react";

export function EnregistrementPwa() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const enregistrerServiceWorker = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((erreur) =>
          console.log("Échec de l'enregistrement du service worker", erreur),
        );
    };

    if (document.readyState === "complete") {
      enregistrerServiceWorker();
      return;
    }

    window.addEventListener("load", enregistrerServiceWorker, { once: true });

    return () => {
      window.removeEventListener("load", enregistrerServiceWorker);
    };
  }, []);

  return null;
}
