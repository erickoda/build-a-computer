use crate::application::ports::otp_store::{OtpStore, OtpStoreError};
use crate::domain::value_objects::email::Email;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct InMemoryOtpStore {
    store: Arc<RwLock<HashMap<String, String>>>,
}

impl InMemoryOtpStore {
    pub fn new() -> Self {
        Self {
            store: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

impl OtpStore for InMemoryOtpStore {
    async fn store_otp(&self, email: &Email, otp: &str) -> Result<(), OtpStoreError> {
        let email_string: String = email.into();
        let mut cache = self.store.write().await;
        cache.insert(email_string, otp.to_string());
        Ok(())
    }

    async fn get_otp(&self, email: &Email) -> Result<Option<String>, OtpStoreError> {
        let email_string: String = email.into();
        let cache = self.store.read().await;

        Ok(cache.get(&email_string).cloned())
    }

    async fn delete_otp(&self, email: &Email) -> Result<(), OtpStoreError> {
        let email_string: String = email.into();
        let mut cache = self.store.write().await;

        cache.remove(&email_string);

        Ok(())
    }
}
