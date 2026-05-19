use regex::Regex;

use crate::domain::errors::UserEntityError;

#[derive(Debug, PartialEq, Clone)]
pub struct Email(String);

impl TryFrom<String> for Email {
    type Error = UserEntityError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        let email_regex: Regex =
            Regex::new(
                r"^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$"
            ).unwrap();

        if email_regex.is_match(&value) {
            return Ok(Self(value));
        }

        Err(UserEntityError::InvalidEmail("Invalid Email".to_string()))
    }
}

impl From<&Email> for String {
    fn from(email: &Email) -> Self {
        email.clone().0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const VALID_EMAILS: &[&str] = &[
        "erick@gmail.com",
        "lorenz.azeitona@usp.com.br",
        "zoega.cali@gomez.com",
        "coringa10@joker.br",
        "erick9._%+-@gmail.com",
    ];

    const INVALID_EMAILS: &[&str] = &[
        "address",
        "@domain.com",
        "username@",
        "username.com",
        "username1@@some.com",
        "user@name1@some.com",
        "user name@domain.com",
        "username@domain com",
        "username@domain..com",
        "user..name@domain.com",
        "username.@domain.com",
        ".username@domain.com",
    ];

    #[test]
    fn try_from_string_success() {
        for &email_str in VALID_EMAILS {
            let email = Email::try_from(email_str.to_string());

            assert!(
                email.is_ok(),
                "Expected valid email to pass, but it failed: '{}'",
                email_str
            );
        }
    }

    #[test]
    fn get_email_returns_correct_string() {
        for &email_str in VALID_EMAILS {
            let email: &Email =
                &Email::try_from(email_str.to_string()).expect("Should be a valid email");
            let result: String = email.into();

            assert_eq!(
                result, email_str,
                "The returned string did not match the input for: '{}'",
                email_str
            );
        }
    }

    #[test]
    fn try_from_string_fails_for_invalid_emails() {
        for &email_str in INVALID_EMAILS {
            let email = Email::try_from(email_str.to_string());

            assert!(
                email.is_err(),
                "Expected invalid email to fail, but it passed: '{}'",
                email_str
            );
        }
    }
}
