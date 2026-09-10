"use client";

import { useEffect } from "react";

const versionDeploiement =
  process.env.NEXT_PUBLIC_VERSION_DEPLOIEMENT ?? "inconnue";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

    const controleurInitial = navigator.serviceWorker.controller;
    let rechargementEffectue = false;
    const rechargerApresMiseAJour = () => {
      if (controleurInitial && !rechargementEffectue) {
        rechargementEffectue = true;
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      rechargerApresMiseAJour,
    );
    navigator.serviceWorker
      .register(`/sw.js?version=${encodeURIComponent(versionDeploiement)}`, {
        updateViaCache: "none",
      })
      .catch((erreur: unknown) => {
        console.error("Échec de l’enregistrement du service worker", erreur);
      });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        rechargerApresMiseAJour,
      );
    };
  }, []);

  return null;
}
