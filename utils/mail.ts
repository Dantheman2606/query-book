// Resend email client
// FROM address: 'CampusConnect <noreply@campusconnect.app>'
//
// sendVerificationEmail(to: string, token: string)
// - Verification URL: `${process.env.APP_URL}/verify-email?token=${token}`
// - Subject: 'Verify your CampusConnect email'
// - Token expires in 24 hours — mention this in the email body
// - HTML body: include a styled button linking to the verification URL
//
// sendPasswordResetEmail(to: string, token: string)
// - Reset URL: `${process.env.APP_URL}/reset-password?token=${token}`
// - Subject: 'Reset your CampusConnect password'
// - Token expires in 1 hour — mention this in the email body