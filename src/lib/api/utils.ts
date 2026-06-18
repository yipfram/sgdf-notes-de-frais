import { NextResponse } from "next/server";

export function jsonError(message: string, status: number): NextResponse {
  console.error("Error: " + status + "   Message: " + message);
  return NextResponse.json({ error: message }, { status });
}

export function verifierErreur(error: Error): NextResponse {
  if (error.message.startsWith("INVALID_ATTACHMENT:"))
    return jsonError(
      "Pièce jointe invalide ou corrompue. Veuillez réessayer.",
      400,
    );
  if (error.message === "SMTP_FROM_UNDEFINED")
    return jsonError(
      "Expéditeur SMTP manquant. Définissez SMTP_FROM ou SMTP_FROM_EMAIL.",
      500,
    );
  if (error.message.includes("Invalid login"))
    return jsonError(
      "Erreur d'authentification SMTP. Vérifiez les identifiants.",
      500,
    );
  if (error.message.includes("SMTP"))
    return jsonError(
      "Erreur de connexion SMTP. Vérifiez la configuration.",
      500,
    );
  return jsonError("Erreur interne du serveur", 500);
}
