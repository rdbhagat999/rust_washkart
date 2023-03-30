use crate::Contract;
use crate::ContractExt;

use crate::ONE_YOCTO_NEAR;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::Vector;
use near_sdk::serde::{Serialize, Deserialize};
use near_sdk::{near_bindgen, PanicOnDefault, AccountId, Timestamp, env, log, Promise, require};
use near_sdk::json_types::U128;

/**
 * all available order statuses
 **/
#[derive(Deserialize, Serialize, BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Copy)]
#[serde(crate = "near_sdk::serde")]
 pub enum OrderStatus {
  Confirmed = 1,
  InProgress,
  Delivered,
  Cancelled,
}

/**
 * all available payment types
 **/
#[derive(Deserialize, Serialize, BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Copy)]
#[serde(crate = "near_sdk::serde")]
pub enum PaymentType {
  Prepaid = 1,
}

/**
 * all available customer feedback responses
 **/
#[derive(Deserialize, Serialize, BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Copy)]
#[serde(crate = "near_sdk::serde")]
pub enum CustomerFeedback {
  None = 1,
  Excellent,
  Good,
  Average,
  Bad,
  Worst,
}

// Implement the contract structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Debug, Clone, PanicOnDefault)]
#[serde(crate = "near_sdk::serde")]
pub struct Order {
  pub id: String,
  pub customer_id: AccountId,
  pub description: String,
  pub weight_in_grams: u32,
  pub price_in_yocto_near: U128,
  pub payment_type: PaymentType,
  pub status: OrderStatus,
  pub customer_feedback: CustomerFeedback,
  pub customer_feedback_comment: String,
  pub pickup_date_time: Timestamp,
  pub delivery_date_time: Timestamp,
}

#[near_bindgen]
impl Order {
  /**
   * Creates an orde for the given account ID.
   * @return newly created Order object for the given ID.
   */
  fn new(
      id: &String,
      customer_id: &AccountId,
      description: &String,
      weight_in_grams: &u32,
      price_in_yocto_near: &U128
    ) -> Order {
      let order = Order {
          id: id.to_owned(),
          customer_id: customer_id.to_owned(),
          description: description.to_owned(),
          weight_in_grams: weight_in_grams.to_owned(),
          price_in_yocto_near: price_in_yocto_near.to_owned(),
          payment_type: PaymentType::Prepaid,
          status: OrderStatus::Confirmed,
          customer_feedback: CustomerFeedback::None,
          customer_feedback_comment: "".to_string(),
          pickup_date_time: env::block_timestamp(),
          delivery_date_time: env::block_timestamp(),
      };

      order
    }
}

// Implement the contract structure
#[near_bindgen]
impl Contract {

    /**
   * Creates a order list for the given account ID.
   * @return newly created Order list for the given account ID.
   */
    fn create_customer_orders_list(&mut self, account_id: AccountId) -> Vector<Order> {
      let customer_orders = self.customer_orders_lookup.get(&account_id).unwrap_or_else(|| {
        let prefix: Vec<u8> = [
                b"s".as_slice(),
                &near_sdk::env::sha256_array(account_id.as_bytes()),
            ]
            .concat();

          Vector::new(prefix)
      });

      customer_orders
    }

    /**
   * Check if an order exists for the given order ID.
   * @return boolean for the given order ID.
   */
    pub fn check_order_exists(&self, order_id: &String) -> bool  {
      let result = self.orders_umap.get(order_id);
      result.is_some()
    }

    /**
   * Creates an order for the given account ID.
   * @return newly created Order object for the given account ID.
   */
    #[payable]
    pub fn create_order(
      &mut self,
      id: String,
      customer_id: AccountId,
      description: String,
      weight_in_grams: u32,
      price_in_yocto_near: U128
    ) -> Order {
      require!(&env::predecessor_account_id().to_string() == &customer_id.to_string(), "You can only create your own order.");
      require!(self.check_customer_exists(&customer_id), "Customer does not exists.");
      require!(!self.check_order_exists(&id), "Order already exists.");

      let deposit_amount: u128 = env::attached_deposit();
      let storage_used_before: u64 = env::storage_usage();

      require!(&deposit_amount >= &(&price_in_yocto_near.0 + &ONE_YOCTO_NEAR), "Deposited amount must be greater than order amount by al least 1 Near.");

      let order = Order::new(
          &id,
          &customer_id,
          &description,
          &weight_in_grams,
          &price_in_yocto_near,
      );

      let mut customer_orders: Vector<Order> = self.create_customer_orders_list(customer_id.clone());

      customer_orders.push(&order);

      self.customer_orders_lookup.insert(&customer_id, &customer_orders);

      self.orders_umap.insert(&id, &order);

      log!("created order with id: {} successfully", &id);

      let final_storage_cost = self.calculate_storage_cost(storage_used_before);

      let final_cost = u128::checked_add(price_in_yocto_near.0, final_storage_cost).unwrap();
      log!("final_cost: {} yN", final_cost);

      let surplus = u128::checked_sub(deposit_amount, final_cost).unwrap();

      if &surplus > &0 {
        Promise::new(env::predecessor_account_id().clone()).transfer(surplus.clone());
        log!("Transferred surplus: {} yN to account_id: {}", &surplus, &env::predecessor_account_id());
      }

      order
    }

    /**
   * Updates an order for the given order ID.
   * @return an updated Order object for the given order ID.
   */
    pub fn update_order_status(&mut self, order_id: String, order_status: OrderStatus) -> Order {
      require!(self.check_is_admin(&env::predecessor_account_id()), "Only admin can update order status.");
      require!(self.check_order_exists(&order_id), "Order does not exists.");

      let storage_used_before: u64 = env::storage_usage();

      let mut order: Order = self.orders_umap.get(&order_id).unwrap();

      if &order_status == &OrderStatus::InProgress {
        require!(&order.status == &OrderStatus::Confirmed, "Order must have Confirmed status.");
      } else if &order_status == &OrderStatus::Delivered {
        require!(&order.status == &OrderStatus::InProgress, "Order must have InProgress status.");
      } else if &order_status == &OrderStatus::Cancelled {
        require!(&order.status != &OrderStatus::Delivered, "Order has Delivered status.");
      } else {
        env::panic_str("Invalid operation")
      }

      let mut customer_orders: Vector<Order> = self.customer_orders_lookup.get(&order.customer_id).unwrap();

      // let (index, found): (u64, Order) = customer_orders.iter().enumerate().find(|(index, mut found): (usize, Order)| -> Option<(u64, Order)> {
      //   if &found.id == &order_id {
      //     found.status = match order_status.clone() {
      //       OrderStatus::Confirmed => env::panic_str("Can not set order status to Confirmed"),
      //       OrderStatus::InProgress => OrderStatus::InProgress,
      //       OrderStatus::Delivered => OrderStatus::Delivered,
      //       OrderStatus::Cancelled => OrderStatus::Cancelled,
      //     };
      //   }
      //   Some((index as u64, found))
      // }).unwrap();

      let mut iter = customer_orders.iter().enumerate().filter(|(_index, found)| found.id == order_id.clone());

      let (index, mut found) = iter.next().unwrap();

      found.status = order_status.clone();

      customer_orders.replace(index as u64, &found);

      self.customer_orders_lookup.insert(&order.customer_id, &customer_orders);

      order.status = order_status;

      self.orders_umap.insert(&order_id, &order);

      log!("updated order status successfully");
      let final_storage_cost = self.calculate_storage_cost(storage_used_before);
      let surplus = u128::checked_sub(found.price_in_yocto_near.0.clone(), final_storage_cost).unwrap();

      if &order.status == &OrderStatus::Cancelled {
        Promise::new(order.customer_id.clone()).transfer(surplus.clone());
        log!("Transferred surplus: {} yN to account_id: {}", surplus, order.customer_id.clone());

      } else if &order.status == &OrderStatus::Delivered {
        Promise::new(env::predecessor_account_id().clone()).transfer(surplus.clone());
        log!("Transferred surplus: {} yN to account_id: {}", &surplus, &env::predecessor_account_id());
      }

      order
     }

     /**
   * Customer can only fetch their own order details for given order ID .
   * @return an Order object for the given order ID.
   */
    pub fn get_order_by_id(&self, order_id: String) -> Order  {
      if self.check_order_exists(&order_id) == false {
        env::panic_str("Order does not exist.")
      }

      let order: Order = self.orders_umap.get(&order_id).unwrap();

      require!(env::predecessor_account_id().to_string() == order.customer_id.to_string(), "You can only fetch your own order.");

      order
    }

    /**
   * Only the admin can call this function.
   * @return Order list.
   */
    pub fn get_order_list(&self) -> Vec<Order>  {
       require!(self.check_is_admin(&env::predecessor_account_id()), "Only admin can call this function.");

      let orders = self.orders_umap.values_as_vector().to_vec();
      orders
    }

    pub fn get_orders_by_customer_id(&mut self, customer_id: AccountId) -> Vec<Order> {
      require!(&env::predecessor_account_id().to_string() == &customer_id.to_string(), "You can only fetch your own orders.");
      require!(self.check_customer_exists(&customer_id), "Customer does not exists.");

      let customer_orders: Vector<Order> = self.create_customer_orders_list(customer_id.clone());

      customer_orders.to_vec()
    }

    /**
   * Submits feedback for the given order ID.
   * @return updated Order object for the given order ID.
   */
    #[payable]
    pub fn submit_feedback(&mut self, order_id: String, customer_feedback: CustomerFeedback, customer_feedback_comment: String) -> Order {
      require!(self.check_order_exists(&order_id), "Order does not exists.");

      let storage_used_before: u64 = env::storage_usage();

      let mut order: Order = self.orders_umap.get(&order_id).unwrap();

      require!(&env::predecessor_account_id().to_string() == &order.customer_id.to_string(), "You can only submit feedback for your own orders.");
      require!(&env::attached_deposit().clone() >= &ONE_YOCTO_NEAR, "Deposited amount must be at least 1 Near.");


      if &order.status != &OrderStatus::Delivered {
        env::panic_str("Order must have Delivered status.");
      }

      let mut customer_orders: Vector<Order> = self.customer_orders_lookup.get(&order.customer_id).unwrap();

      let (index, found): (u64, Order) = customer_orders.iter().enumerate().find_map(|(index, mut found): (usize, Order)| -> Option<(u64, Order)> {
        if &found.id == &order_id {
          found.customer_feedback = customer_feedback;
          found.customer_feedback_comment = customer_feedback_comment.clone();
        }
        Some((index as u64, found))
      }).unwrap();

      customer_orders.replace(index, &found);
      self.customer_orders_lookup.insert(&order.customer_id, &customer_orders);

      order.customer_feedback = customer_feedback;
      order.customer_feedback_comment = customer_feedback_comment;
      self.orders_umap.insert(&order_id, &order);

      log!("submitted order feedback successfully");
      let final_storage_cost = self.calculate_storage_cost(storage_used_before);
      let surplus = u128::checked_sub(env::attached_deposit().clone(), final_storage_cost).unwrap();

      Promise::new(found.customer_id.clone()).transfer(surplus.clone());
      log!("Transferred surplus: {} yN to account_id: {}", &surplus, &found.customer_id);

      order
    }
}
