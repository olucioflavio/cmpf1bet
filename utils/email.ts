import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

type BetConfirmationProps = {
    email: string
    userName: string
    raceName: string
    track: string
    bets: {
        pole: string
        p1: string
        p2: string
        p3: string
        p4: string
        p5: string
        bortoleto: string
        variable?: string
        variableDriverName?: string
        catapulta: boolean
    }
}

export async function sendBetConfirmation({ email, userName, raceName, track, bets }: BetConfirmationProps) {
    console.log('--- Email Debug Start ---')
    console.log(`Attempting to send email to: ${email}`)
    console.log(`API Key present: ${!!process.env.RESEND_API_KEY}`)

    if (!resend) {
        console.error('RESEND_API_KEY is missing or client failed to initialize')
        console.log('--- Email Debug End ---')
        return
    }

    try {
        console.log('Calling Resend API...')
        const { data, error } = await resend.emails.send({
            from: 'CMPF1 Bet <onboarding@resend.dev>',
            to: [email],
            subject: `Confirmação de Aposta: ${raceName}`,
            html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #e10600; text-align: center;">CMPF1 Bet</h1>
          <h2 style="text-align: center;">Aposta Confirmada!</h2>
          <p>Olá <strong>${userName}</strong>,</p>
          <p>Sua aposta para o <strong>${raceName}</strong> (${track}) foi registrada com sucesso.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Seus Palpites:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>Pole Position:</strong> ${bets.pole}</li>
              <li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>P1:</strong> ${bets.p1}</li>
              <li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>P2:</strong> ${bets.p2}</li>
              <li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>P3:</strong> ${bets.p3}</li>
              <li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>P4:</strong> ${bets.p4}</li>
              <li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>P5:</strong> ${bets.p5}</li>
              <li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>Gabrial Bortoleto:</strong> P${bets.bortoleto}</li>
              ${bets.variable ? `<li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>${bets.variableDriverName}:</strong> P${bets.variable}</li>` : ''}
              ${bets.catapulta ? `<li style="padding: 5px 0; border-bottom: 1px solid #eee; color: #8b5cf6;"><strong>🚀 Função Catapulta Ativada! (Pontos x2)</strong></li>` : ''}
            </ul>
          </div>
          
          <p style="text-align: center; color: #999; font-size: 12px;">Boa sorte!<br>Equipe CMPF1 Bet</p>
        </div>
      `
        })

        if (error) {
            console.error('Error sending email (Resend API):', error)
        } else {
            console.log('Email sent successfully:', data)
        }
    } catch (err) {
        console.error('Exception sending email:', err)
    }
    console.log('--- Email Debug End ---')
}
