import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // For now, this is a placeholder API that would be configured with an email service
    // In production, you would integrate with your preferred email service (Resend, SendGrid, etc.)
    
    const formData = await request.formData();
    const date = formData.get('date') as string;
    const branch = formData.get('branch') as string;
    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;
    const recipientEmail = formData.get('recipientEmail') as string;
    const file = formData.get('file') as File;

    if (!date || !branch || !amount || !description || !recipientEmail || !file) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }

    // TODO: Integrate with your email service here
    // For example: Resend, SendGrid, NodeMailer with SMTP, etc.
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, return success
    // In production, you would actually send the email here
    console.log('Email would be sent to:', recipientEmail);
    console.log('Expense details:', { date, branch, amount, description });
    console.log('File:', file.name, file.size);

    return NextResponse.json({ 
      success: true, 
      message: 'Email simulé avec succès (fonctionnalité de démo)' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}