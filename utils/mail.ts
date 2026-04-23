import nodemailer from 'nodemailer';

function getRequiredEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

function getAppUrl(): string {
	return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function createTransporter() {
	const host = getRequiredEnv('SMTP_HOST');
	const port = Number(process.env.SMTP_PORT || '587');
	const user = getRequiredEnv('SMTP_USER');
	const pass = getRequiredEnv('SMTP_PASS');

	return nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: {
			user,
			pass,
		},
	});
}

function getFromAddress(): string {
	return process.env.SMTP_FROM || 'QueryBook <noreply@querybook.app>';
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
	const transporter = createTransporter();
	const appUrl = getAppUrl();
	const verificationUrl = `${appUrl}/api/auth/verifyEmail?token=${encodeURIComponent(token)}`;

	await transporter.sendMail({
		from: getFromAddress(),
		to,
		subject: 'Verify your QueryBook email',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
				<h2 style="margin-bottom: 12px;">Welcome to QueryBook</h2>
				<p style="margin-bottom: 16px; line-height: 1.5;">
					Please verify your email address to activate your account.
				</p>
				<a href="${verificationUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;">
					Verify Email
				</a>
				<p style="margin-top: 16px; font-size: 12px; color: #6b7280; line-height: 1.5;">
					This link expires in 24 hours. If you did not create this account, you can ignore this email.
				</p>
			</div>
		`,
		text: `Welcome to QueryBook. Verify your email by visiting: ${verificationUrl}. This link expires in 24 hours.`,
	});
}