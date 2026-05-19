use regex::Regex;

use crate::domain::errors::UserEntityError;

#[derive(Debug, PartialEq, Clone)]
pub struct PlainPassword(String);

impl TryFrom<String> for PlainPassword {
    type Error = UserEntityError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        let special_char_regex: Regex = Regex::new(r"[^a-zA-Z0-9]").unwrap();

        if value.len() < 8 {
            return Err(UserEntityError::InvalidPassword(
                "Invalid Password Size! Password must have at least 8 characters!!!".to_string(),
            ));
        }

        if value.len() > 24 {
            return Err(UserEntityError::InvalidPassword(
                "Invalid Password Size! Password must have at most 24 characters!!!".to_string(),
            ));
        }

        if !special_char_regex.is_match(&value) {
            return Err(UserEntityError::InvalidPassword(
                "Invalid Password Format! Password must have at least 1 special character"
                    .to_string(),
            ));
        }

        Ok(Self(value))
    }
}

impl PlainPassword {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[cfg(test)]
mod test {
    use super::*;

    const VALID_PASSWORDS: [&str; 3] = ["y2W0G.*9", "o2N1\\9X*", "b+*9x/u5KMYF||\">k|30YO:@"];
    const INVALID_PASSWORDS: [&str; 3] = ["y2W0G.*", "12345678", "b+*9x/u5KMYF||\">k|30YO:@a"];

    #[test]
    pub fn test_try_from_string_for_password_success() {
        for password_str in VALID_PASSWORDS {
            let password: Result<PlainPassword, UserEntityError> =
                PlainPassword::try_from(password_str.to_string());

            assert!(
                password.is_ok(),
                "Expected valid password, but it failed. Password: {}",
                password_str
            )
        }
    }

    #[test]
    pub fn test_get() {
        for password_str in VALID_PASSWORDS {
            let password: &PlainPassword =
                &PlainPassword::try_from(password_str.to_string()).unwrap();
            let result: String = password.as_str().to_string();

            assert_eq!(
                result, password_str,
                "Expected valid password, but it failed. Password: {}",
                password_str
            )
        }
    }

    #[test]
    pub fn test_try_from_string_for_password_fail() {
        for password_str in INVALID_PASSWORDS {
            let password: Result<PlainPassword, UserEntityError> =
                PlainPassword::try_from(password_str.to_string());

            assert!(
                password.is_err(),
                "Expected invalid password, but it successed. Password: {}",
                password_str
            )
        }
    }
}
