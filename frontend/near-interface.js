/* Talking with a contract often involves transforming data, we recommend you to encapsulate that logic into a class */
import { utils } from "near-api-js";

export class NearContract {
  constructor({ contractId, walletToUse }) {
    this.contractId = contractId;
    this.wallet = walletToUse;
  }

  async check_is_admin(account_id) {
    return await this.wallet.viewMethod({
      contractId: this.contractId,
      method: "check_is_admin",
      args: { account_id },
    });
  }

  async check_customer_exists(account_id) {
    return await this.wallet.viewMethod({
      contractId: this.contractId,
      method: "check_customer_exists",
      args: { account_id },
    });
  }

  async check_order_exists(order_id) {
    return await this.wallet.viewMethod({
      contractId: this.contractId,
      method: "check_order_exists",
      args: { order_id },
    });
  }

  async create_admin(account_id) {
    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "create_admin",
      args: { account_id },
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async get_admin_by_account_id(account_id) {
    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "get_admin_by_account_id",
      args: { account_id },
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async get_customer_by_account_id(account_id) {
    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "get_customer_by_account_id",
      args: { account_id },
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async get_order_by_id(order_id) {
    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "get_order_by_id",
      args: { order_id },
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async get_orders_by_customer_id(customer_id) {
    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "get_orders_by_customer_id",
      args: { customer_id },
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async get_order_list() {
    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "get_order_list",
      args: {},
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async create_customer(
    account_id,
    name,
    phone,
    email,
    full_address,
    landmark,
    google_plus_code_address
  ) {
    const deposit = utils.format.parseNearAmount(`${1}`);
    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "create_customer",
      args: {
        account_id,
        name,
        phone,
        email,
        full_address,
        landmark,
        google_plus_code_address,
      },
      deposit,
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async update_customer(
    account_id,
    name,
    phone,
    email,
    full_address,
    landmark,
    google_plus_code_address
  ) {
    const deposit = utils.format.parseNearAmount(`${1}`);

    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "update_customer",
      args: {
        account_id,
        name,
        full_address,
        landmark,
        google_plus_code_address,
        phone,
        email,
      },
      deposit,
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async create_order(id, customer_id, description, weight_in_grams, price) {
    const deposit = utils.format.parseNearAmount(`${price + 1}`);
    const price_in_yocto_near = utils.format.parseNearAmount(`${price}`);

    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "create_order",
      args: {
        id,
        customer_id,
        description,
        weight_in_grams: parseInt(weight_in_grams, 10),
        price_in_yocto_near,
      },
      deposit,
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async update_order_status(order_id, order_status) {
    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "update_order_status",
      args: {
        order_id,
        order_status,
      },
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }

  async submit_feedback(
    order_id,
    customer_feedback,
    customer_feedback_comment = ""
  ) {
    const deposit = utils.format.parseNearAmount(`${1}`);

    const result = await this.wallet.callMethod({
      contractId: this.contractId,
      method: "submit_feedback",
      args: {
        order_id,
        customer_feedback,
        customer_feedback_comment,
      },
      deposit,
    });

    return await this.wallet.getTransactionResult(result.transaction.hash);
  }
}
