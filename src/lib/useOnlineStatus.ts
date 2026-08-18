import { useEffect, useState } from "react";

export function useStatutEnLigne() {
  const [estEnLigne, definirEstEnLigne] = useState<boolean>(true);

  useEffect(() => {
    const actualiser = () => definirEstEnLigne(navigator.onLine);
    actualiser();
    window.addEventListener("online", actualiser);
    window.addEventListener("offline", actualiser);
    return () => {
      window.removeEventListener("online", actualiser);
      window.removeEventListener("offline", actualiser);
    };
  }, []);

  return estEnLigne;
}
