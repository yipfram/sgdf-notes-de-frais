const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;

export function normaliserIban(valeur: string): string {
  return valeur.replace(/\s+/g, "").toUpperCase();
}

export function estIbanValide(valeur: string): boolean {
  const iban = normaliserIban(valeur);
  if (iban.length < 15 || iban.length > 34 || !IBAN_REGEX.test(iban)) {
    return false;
  }

  const reordonne = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let reste = 0;

  for (const caractere of reordonne) {
    const bloc =
      caractere >= "A" && caractere <= "Z"
        ? caractere.charCodeAt(0) - 55
        : caractere;
    const chiffres = String(bloc);
    for (const chiffre of chiffres) {
      reste = (reste * 10 + Number(chiffre)) % 97;
    }
  }

  return reste === 1;
}
