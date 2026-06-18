import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { sendExpenseEmail } from "@/lib/email";
import { jsonError, checkEmailError } from "@/lib/api/utils";
import { validateBody } from "@/lib/api/validateBody";

function validateEnv() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD ||
    !process.env.NEXT_PUBLIC_TREASURY_EMAIL
  ) {
    console.error("Variables d'environnement manquantes pour SMTP");
    return jsonError("Configuration serveur manquante", 500);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Auth
    const { userId } = await auth();
    if (!userId) return jsonError("Non autorisé", 401);
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userEmail = user.primaryEmailAddress?.emailAddress;
    // Env vars
    const envError = validateEnv();
    if (envError) return envError;

    // Body & validation
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Corps de requête invalide", 400);
    if (body.userEmail !== userEmail)
      return jsonError("Mauvais utilisateur", 403);

    const { emailData, error } = validateBody(body);
    if (error || !emailData) return error as NextResponse;

    // Send email
    const result = await sendExpenseEmail(emailData);
    return NextResponse.json({
      success: true,
      message: "Email envoyé avec succès",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    if (error instanceof Error) {
      return checkEmailError(error);
    }
    return jsonError("Erreur interne du serveur", 500);
  }
}
