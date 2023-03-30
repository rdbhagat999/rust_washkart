use crate::Contract;
use crate::ContractExt;

use crate::ONE_YOCTO_NEAR;
use crate::UserRole;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize, Deserialize};
use near_sdk::{near_bindgen, PanicOnDefault, AccountId, Timestamp, env, log, Promise, require};
// use near_sdk::json_types::U128;

#[near_bindgen]
#[derive(Deserialize, Serialize, BorshDeserialize, BorshSerialize, Debug, Clone, PanicOnDefault)]
#[serde(crate = "near_sdk::serde")]
pub struct User {
  pub id: AccountId,
  pub name: String,
  pub full_address: String,
  pub landmark: String,
  pub google_plus_code_address: String,
  pub phone: String,
  pub email: String,
  pub role: UserRole,
  pub created: Timestamp,
  pub updated: Timestamp,
}

#[near_bindgen]
impl User {
  /**
   * Creates a user for the given account ID.
   * @return User object for the given ID.
  */
  fn new(account_id: &AccountId, name: &String, full_address: &String, landmark: &String, google_plus_code_address: &String, phone: &String, email: &String) -> User {
    let customer = User {
        id: account_id.to_owned(),
        name: name.to_owned(),
        full_address: full_address.to_owned(),
        landmark: landmark.to_owned(),
        google_plus_code_address: google_plus_code_address.to_owned(),
        phone: phone.to_owned(),
        email: email.to_owned(),
        role: UserRole::Customer,
        created: env::block_timestamp(),
        updated: env::block_timestamp(),
    };

    customer
  }
}

// Implement the contract structure
#[near_bindgen]
impl Contract {

    /**
   * Creates a customer for the given account ID.
   * @return newly created Customer object for the given ID.
   */
    #[payable]
    pub fn create_customer(&mut self, account_id: AccountId, name: String, phone: String, email: String, full_address: String, landmark: String, google_plus_code_address: String, ) -> User {
      require!(&env::predecessor_account_id().to_string() == &account_id.to_string(), "You can only register your own account.");

      let deposit_amount: u128 = env::attached_deposit();
      let storage_used_before: u64 = env::storage_usage();

      require!(&deposit_amount >= &ONE_YOCTO_NEAR, "Deposited amount must be at least 1 Near.");

      let exists = self.check_customer_exists(&account_id);

      if exists == true {
        env::panic_str("Account already exists.")
      }

      let customer = User::new(
          &account_id,
          &name,
          &full_address,
          &landmark,
          &google_plus_code_address,
          &phone,
          &email,
      );

      self.customers_umap.insert(&account_id, &customer);

      log!("created customer: {} successfully", &account_id);

      let final_storage_cost = self.calculate_storage_cost(storage_used_before.clone());

      let surplus = u128::checked_sub(deposit_amount, final_storage_cost).unwrap();

      if &surplus > &0 {
        Promise::new(env::predecessor_account_id().clone()).transfer(surplus);
        log!("Transferred surplus: {} yN to account_id: {}", surplus, &env::predecessor_account_id());
      }

      customer
    }

    /**
   * Updates a customer for the given account ID.
   * @return updated Customer object for the given ID.
   */
    #[payable]
    pub fn update_customer(&mut self, account_id: AccountId, name: String, phone: String, email: String, full_address: String, landmark: String, google_plus_code_address: String, ) -> User {
      require!(env::predecessor_account_id().to_string() == account_id.to_string(), "You can only update your own account.");

      let exists = self.check_customer_exists(&account_id);

      if exists == false {
        env::panic_str("Account does not exist.")
      }

      let deposit_amount: u128 = env::attached_deposit();
      let storage_used_before: u64 = env::storage_usage();

      require!(&deposit_amount >= &ONE_YOCTO_NEAR, "Deposited amount must be at least 1 Near.");

      let mut customer = self.get_customer_by_account_id(account_id.clone());

      customer.name = name;
      customer.full_address = full_address;
      customer.landmark = landmark;
      customer.google_plus_code_address = google_plus_code_address;
      customer.phone = phone;
      customer.email = email;

      self.customers_umap.insert(&account_id, &customer);

      log!("updated customer: {} successfully", &account_id);

      let final_storage_cost = self.calculate_storage_cost(storage_used_before);

      let surplus = u128::checked_sub(deposit_amount, final_storage_cost).unwrap();

      if &surplus > &0 {
        Promise::new(env::predecessor_account_id().clone()).transfer(surplus);
        log!("Transferred surplus: {} yN to account_id: {}", &surplus, &env::predecessor_account_id());
      }

      customer
    }

    /**
   * Checks if customer for the given account ID exists.
   * @return boolean for the given ID.
   */
    pub fn check_customer_exists(&self, account_id: &AccountId) -> bool  {
       let result = self.customers_umap.get(account_id);
       result.is_some()
    }

    /**
     * Customer can obly get their own details.
     *  @return an Customer object for the given ID.
    */
    pub fn get_customer_by_account_id(&self, account_id: AccountId) -> User  {
      require!(&env::predecessor_account_id().to_string() == &account_id.to_string(), "You can only fetch your own account.");

      let result = self.customers_umap.get(&account_id);

      match result {
        Some(user) => user,
        None => env::panic_str("Account does not exist.")
      }
    }
}
