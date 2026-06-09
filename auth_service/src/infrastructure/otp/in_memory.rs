use crate::application::ports::otp_store::{OtpStore, OtpStoreError};
use crate::domain::value_objects::email::Email;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

pub struct InMemoryOtpStore {
    store: Arc<RwLock<HashMap<String, (String, Instant)>>>,
    ttl: Duration,
}

impl InMemoryOtpStore {
    pub fn new(ttl: Duration) -> Self {
        Self {
            store: Arc::new(RwLock::new(HashMap::new())),
            ttl,
        }
    }
}

impl OtpStore for InMemoryOtpStore {
    async fn store_otp(&self, email: &Email, otp: &str) -> Result<(), OtpStoreError> {
        let email_string: String = email.into();
        let mut cache = self.store.write().await;
        cache.insert(email_string, (otp.to_string(), Instant::now()));
        Ok(())
    }

    async fn get_otp(&self, email: &Email) -> Result<Option<String>, OtpStoreError> {
        let email_string: String = email.into();
        let cache = self.store.read().await;

        let value_opt = cache.get(&email_string).cloned();

        if let Some(value) = value_opt {
            let instant = value.1;
            let now = Instant::now();
            let expired = instant + self.ttl < now;

            if expired {
                return Ok(None);
            }
        }

        Ok(cache.get(&email_string).cloned().map(|c| c.0))
    }

    async fn delete_otp(&self, email: &Email) -> Result<(), OtpStoreError> {
        let email_string: String = email.into();
        let mut cache = self.store.write().await;

        cache.remove(&email_string);

        Ok(())
    }
}
