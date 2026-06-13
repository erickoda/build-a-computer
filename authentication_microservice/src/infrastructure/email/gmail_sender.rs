use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};

use crate::application::ports::email_sender::{EmailSender, EmailSenderError};
use crate::domain::value_objects::email::Email;

#[derive(Clone)]
pub struct GmailSender {
    mailer: AsyncSmtpTransport<Tokio1Executor>,
    from_email: String,
}

impl GmailSender {
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
    async fn send_otp(&self, to: &Email, otp: &str) -> Result<(), EmailSenderError> {
        let email_body = format!(
            "Hello,\n\nYour password recovery code is: {}\n\nIf you did not request this, please ignore this email.",
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
            .subject("Password Recovery Code")
            .header(ContentType::TEXT_PLAIN)
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
