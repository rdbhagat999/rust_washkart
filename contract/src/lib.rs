use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{require, BorshStorageKey};
use near_sdk::collections::{UnorderedMap, LookupMap, Vector};
use near_sdk::serde::{Serialize, Deserialize};
use near_sdk::{near_bindgen, PanicOnDefault, AccountId, env, log};

pub mod admin;
pub mod user;
pub mod order;

pub use crate::admin::*;
pub use crate::user::*;
pub use crate::order::*;

pub const ONE_YOCTO_NEAR: u128 = 1_000_000_000_000_000_000_000_000;
pub const TGAS: u64 = 1_000_000_000_000;
pub const NO_DEPOSIT: u128 = 0;


#[derive(Deserialize, Serialize, BorshStorageKey, BorshSerialize, Debug, Clone, Copy)]
#[serde(crate = "near_sdk::serde")]
pub enum StorageKeys {
    Admins,
    Users,
    Orders,
    CustomerOrders
}

#[derive(Deserialize, Serialize, BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Copy)]
#[serde(crate = "near_sdk::serde")]
pub enum UserRole {
  Customer = 1,
  Admin,
}

// Define the default message
const PROJECT_INFO: &str = "This is a Near blockchain project";

// Define the contract structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault, Debug)]
pub struct Contract {
    pub admin_lookup: LookupMap<AccountId, Admin>,
    pub customers_umap: UnorderedMap<AccountId, User>,
    pub orders_umap: UnorderedMap<String, Order>,
    pub customer_orders_lookup: LookupMap<AccountId, Vector<Order>>,
}

// Implement the contract structure
#[near_bindgen]
impl Contract {

    /**
     * Initializes contract. Only contract can call this function.
     * @return Contract.
    */
    #[init]
    #[private]
    pub fn init() -> Self {
        require!(!env::state_exists(), "Already initialized");

        log!("Initializing contract...");

        Self {
            admin_lookup: LookupMap::new(StorageKeys::Admins),
            customers_umap: UnorderedMap::new(StorageKeys::Users),
            orders_umap: UnorderedMap::new(StorageKeys::Orders),
            customer_orders_lookup: LookupMap::new(StorageKeys::CustomerOrders)
        }
    }

    /**
     * Calculates storage cost.
     * @return storage cost
    */
    fn calculate_storage_cost(&self, storage_used_before: u64) -> u128 {
        log!("storage_used_before: {} bytes", storage_used_before);

        let storage_used_after: u64 = env::storage_usage();
        log!("storage_used_after: {} bytes", storage_used_after);

        let payable_storage: u64 = storage_used_after - storage_used_before;
        log!("payable_storage: {} bytes", payable_storage);

        let storage_cost_per_byte = env::storage_byte_cost();
        log!("storage_cost_per_byte: {} yN", storage_cost_per_byte);

        let final_storage_cost = u128::checked_mul(storage_cost_per_byte, payable_storage.into()).unwrap();
        log!("final_storage_cost: {} yN", final_storage_cost);

        final_storage_cost
    }

    /**
     * Get details about the project
     * @return details about the project
    */
    pub fn get_project_info(&self) -> String {
        log!("executing: get_project_info");
        return PROJECT_INFO.to_string();
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 */
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn initializes() {
        let contract = Contract::init();
        assert_eq!(
            contract.get_project_info(),
            PROJECT_INFO.to_string()
        );
    }
}
