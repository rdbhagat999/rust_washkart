#!/bin/sh

# chmod 755 run.sh

# 3 yoctoNear = 3000000000000000000000000

echo ">> Running contract methods"
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:init"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 init '{}' --accountId dev-1665068266464-27599380827838
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:create_admin"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 create_admin '{"account_id": "millefolium.testnet"}' --accountId dev-1665068266464-27599380827838
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:check_is_admin"
echo ">> ..."
echo ">> ..."
near view dev-1665068266464-27599380827838 check_is_admin '{"account_id": "millefolium.testnet"}' --accountId millefolium.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:get_admin_by_account_id"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 get_admin_by_account_id '{"account_id": "millefolium.testnet"}' --accountId millefolium.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:create_customer"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 create_customer '{
    "account_id": "envoy.testnet", "name": "envoy.testnet",
    "phone": "", "email": "", "full_address": "123 street, NY", "landmark": "",
    "google_plus_code_address": ""
}' --deposit 1 --accountId envoy.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:create_customer"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 create_customer '{
    "account_id": "sunroz.testnet", "name": "sunroz.testnet",
    "phone": "", "email": "", "full_address": "123 street, NY", "landmark": "",
    "google_plus_code_address": ""
}' --deposit 1 --accountId sunroz.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:check_customer_exists"
echo ">> ..."
echo ">> ..."
near view dev-1665068266464-27599380827838 check_customer_exists '{"account_id": "envoy.testnet"}' --accountId envoy.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:get_customer_by_account_id"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 get_customer_by_account_id '{"account_id": "envoy.testnet"}' --accountId envoy.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:update_customer"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 update_customer '{
    "account_id": "envoy.testnet", "name": "envoy.testnet",
    "phone": "1234567890", "email": "envoy@email.com", "full_address": "123 street, NY",
    "landmark": "Central park", "google_plus_code_address": ""
}' --deposit 1 --accountId envoy.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:create_order"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 create_order '{
    "id": "fghjk", "customer_id": "envoy.testnet", "description": "2 pants",
    "weight_in_grams": 3500, "price_in_yocto_near": "3000000000000000000000000"
}' --deposit 4 --accountId envoy.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:create_order"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 create_order '{
    "id": "sxdhjk", "customer_id": "sunroz.testnet", "description": "2 shirts",
    "weight_in_grams": 3500, "price_in_yocto_near": "3000000000000000000000000"
}' --deposit 4 --accountId sunroz.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:check_order_exists"
near view dev-1665068266464-27599380827838 check_order_exists '{"order_id": "fghjk"}' --accountId millefolium.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:get_order_by_id"
near call dev-1665068266464-27599380827838 get_order_by_id '{"order_id": "fghjk"}' --accountId envoy.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:update_order_status"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 update_order_status '{"order_id": "fghjk", "order_status": "InProgress"}' --accountId millefolium.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:get_order_list"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 get_order_list '{}' --accountId millefolium.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:get_orders_by_customer_id"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 get_orders_by_customer_id '{"customer_id": "sunroz.testnet"}' --accountId sunroz.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:update_order_status"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 update_order_status '{"order_id": "sxdhjk", "order_status": "Cancelled"}' --accountId millefolium.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:update_order_status"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 update_order_status '{"order_id": "Y_cKGw9kp2Pp23cmYUBqS", "order_status": "Delivered"}' --accountId millefolium.testnet
echo ">> ..."
echo ">> ..."
echo ">> Running contract methods:submit_feedback"
echo ">> ..."
echo ">> ..."
near call dev-1665068266464-27599380827838 submit_feedback '{"order_id": "fghjk", "customer_feedback": "Good", "customer_feedback_comment": "very good service."}' --deposit 1 --accountId envoy.testnet
echo ">> ..."
echo ">> ..."
