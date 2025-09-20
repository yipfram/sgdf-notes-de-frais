import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // This is a placeholder for email sending functionality
    // In a real implementation, you would integrate with a service like Resend
    
    const formData = await request.formData()
    const date = formData.get('date') as string
    const branch = formData.get('branch') as string
    const amount = formData.get('amount') as string
    const description = formData.get('description') as string
    const image = formData.get('image') as File

    // Validate required fields
    if (!date || !branch || !amount || !description || !image) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Log the expense for demonstration
    console.log('Expense received:', {
      date,
      branch,
      amount,
      description,
      imageSize: image.size,
      imageType: image.type
    })

    // In a real implementation, you would:
    // 1. Save the renamed image to a storage service
    // 2. Send an email with Resend or similar service
    // 3. Return success/failure status

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Note de frais envoyée avec succès',
      fileName: `${date} - ${branch} - ${amount}.jpg`
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}