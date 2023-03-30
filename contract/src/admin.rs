use crate::Contract;
use crate::ContractExt;

use crate::UserRole;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize, Deserialize};
use near_sdk::{near_bindgen, PanicOnDefault, AccountId, Timestamp, env, log, require};

#[near_bindgen]
#[derive(Deserialize, Serialize, BorshDeserialize, BorshSerialize, Debug, Clone, PanicOnDefault)]
#[serde(crate = "near_sdk::serde")]
pub struct Admin {
  pub id: AccountId,
  pub role: UserRole,
  pub created: Timestamp,
  pub updated: Timestamp,
}

#[near_bindgen]
impl Admin {
    /**
   * Creates an admin for the given account ID.
   * @return Admin object for the given ID.
   */
     fn new(account_id: &AccountId) -> Admin {
        let admin: Admin = Admin {
          id: account_id.to_owned(),
          role: UserRole::Admin,
          created: env::block_timestamp(),
          updated: env::block_timestamp(),
      };
      admin
    }
}

// Implement the contract structure
#[near_bindgen]
impl Contract {

    /**
   * Creates an admin for the given account ID.
   * @return newly created Admin object for the given ID.
   */
    #[private]
    pub fn create_admin(&mut self, account_id: AccountId) -> Admin {
      require!(env::predecessor_account_id() == env::current_account_id(), "Only the contract can call this message.");

      let exists: bool = self.check_is_admin(&account_id);

      if exists == true {
        env::panic_str("Account already exists.")
      }

      let admin: Admin = Admin::new(&account_id);

      self.admin_lookup.insert(&account_id, &admin);

      log!("created admin: {} successfully", &account_id);

      admin
    }

    /**
   * Deletes an admin for the given account ID.
   * @return deleted Admin object for the given ID.
   */
    #[private]
    pub fn delete_admin(&mut self, account_id: AccountId) -> Admin {
      require!(env::predecessor_account_id() == env::current_account_id(), "Only the contract can call this message.");

      let exists: bool = self.check_is_admin(&account_id);

      let deleted_admin: Option<Admin>;

      if exists == true {
        deleted_admin = self.admin_lookup.remove(&account_id);
      } else {
        env::panic_str("Account not found.")
      }

      log!("deleted admin: {} successfully", &account_id);

      deleted_admin.unwrap()
    }

   /**
   * Only the admin can call this message.
   * @return an Admin object for the given ID.
   */
    pub fn get_admin_by_account_id(&self, account_id: AccountId) -> Admin  {
      require!(self.check_is_admin(&env::predecessor_account_id()), "Only the admin can call this message.");

      let result = self.admin_lookup.get(&account_id);

      match result {
        Some(admin) => admin,
        None => env::panic_str("Account not found.")
      }
    }

    /**
   * Checks if admin with given ID exists.
   * @return bollean for the given ID.
   */
    pub fn check_is_admin(&self, account_id: &AccountId) -> bool  {
      self.admin_lookup.contains_key(account_id)
    }
}
