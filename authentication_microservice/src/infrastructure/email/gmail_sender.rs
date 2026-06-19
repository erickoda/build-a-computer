use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};

use crate::application::ports::email_sender::{EmailSender, EmailSenderError};
use crate::domain::value_objects::email::Email;

/// Adaptador de infraestrutura para envio de e-mails via Gmail (SMTP).
///
/// Implementa a porta [`EmailSender`] utilizando a biblioteca [`lettre`] para disparar
/// mensagens assíncronas através dos servidores do Google.
#[derive(Clone)]
pub struct GmailSender {
    /// O cliente de transporte SMTP assíncrono configurado com o executor do Tokio.
    ///
    /// Responsável por gerenciar o pool de conexões com os servidores do Google
    /// e executar o disparo da rede de forma não-bloqueante.
    mailer: AsyncSmtpTransport<Tokio1Executor>,

    /// O endereço de e-mail que aparecerá no campo de remetente para o usuário.
    ///
    /// Corresponder à mesma conta utilizada nas credenciais de
    /// autenticação do SMTP.
    from_email: String,
}

impl GmailSender {
    /// Inicializa o cliente SMTP do Gmail.
    ///
    /// Exige o e-mail remetente e uma "App Password" (Senha de Aplicativo) do Google,
    /// não a senha comum da conta, por questões de segurança.
    pub fn new(smtp_username: String, smtp_password: String) -> Result<Self, EmailSenderError> {
        let creds = Credentials::new(smtp_username.clone(), smtp_password);

        let mailer = AsyncSmtpTransport::<Tokio1Executor>::relay("smtp.gmail.com")
            .map_err(|e| {
                EmailSenderError::ConnectionError(format!("Failed to configure SMTP relay: {}", e))
            })?
            .credentials(creds)
            .build();

        Ok(Self {
            mailer,
            from_email: smtp_username,
        })
    }
}

impl EmailSender for GmailSender {
    /// Dispara o e-mail contendo o código de segurança (OTP) para o usuário.
    ///
    /// Utiliza um corpo em formato HTML injetado com CSS inline para garantir
    /// renderização consistente na maioria dos clientes de e-mail.
    async fn send_otp(&self, to: &Email, otp: &str) -> Result<(), EmailSenderError> {
        let email_body = format!(
            r#"
            <div
                style="background-color: #f9fafb;
                padding: 40px 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"
            >
                <div 
                    style="
                        max-width: 500px; 
                        margin: 0 auto; 
                        background-color: #ffffff; 
                        border: 1px solid #e5e7eb; 
                        border-radius: 12px; 
                        padding: 40px; 
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    "
                >
                    <h2 style="color: #111827; font-size: 22px; font-weight: 600; margin: 0 0 16px 0;">
                        Password Recovery
                    </h2>
                    
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 32px 0;">
                        We received a request to reset the password for your account. Please use the verification code below to proceed:
                    </p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <span 
                            style="
                                display: inline-block;
                                font-family: 'Courier New', Courier, monospace;
                                font-size: 36px; 
                                font-weight: 700; 
                                color: #2563eb; 
                                background-color: #eff6ff; 
                                border: 1px solid #bfdbfe;
                                padding: 16px 32px; 
                                border-radius: 8px; 
                                letter-spacing: 8px;
                            "
                        >
                            {}
                        </span>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 32px 0;">
                        If you did not request a password reset, please ignore this email. Your account remains secure.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px 0;">
                    
                    <p style="font-size: 14px; color: #9ca3af; line-height: 1.5; margin: 0;">
                        Best regards,<br>
                        <strong style="color: #4b5563;">Build a Computer Team</strong>
                    </p>
                </div>
            </div>
            "#,
            otp
        );

        let email = Message::builder()
            .from(
                self.from_email
                    .parse()
                    .map_err(|e| EmailSenderError::BuildError(format!("Invalid sender: {}", e)))?,
            )
            .to(String::from(to)
                .parse()
                .map_err(|e| EmailSenderError::BuildError(format!("Invalid recipient: {}", e)))?)
            .subject("🔒 [Build a Computer] Password Recovery Code")
            .header(ContentType::TEXT_HTML)
            .body(email_body)
            .map_err(|e| {
                EmailSenderError::BuildError(format!("Error structuring the email: {}", e))
            })?;

        self.mailer.send(email).await.map_err(|e| {
            EmailSenderError::SendError(format!("Failed to dispatch email via Gmail: {}", e))
        })?;

        Ok(())
    }
}
