// React
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./lib/Auth";

// NEAR
import { NearContract } from "./near-interface";
import { Wallet } from "./near-wallet";

const reactRoot = createRoot(document.querySelector("#root"));

const CONTRACT_NAME =
  process.env.CONTRACT_NAME || "dev-1665068266464-27599380827838";
console.log(CONTRACT_NAME);
// When creating the wallet you can optionally ask to create an access key
// Having the key enables to call non-payable methods without interrupting the user to sign
const wallet = new Wallet({ createAccessKeyFor: CONTRACT_NAME });

// Abstract the logic of interacting with the contract to simplify your flow
const contract = new NearContract({
  contractId: CONTRACT_NAME,
  walletToUse: wallet,
});

// Setup on page load
window.onload = async () => {
  const { isSignedIn, accountId } = await wallet.startUp();

  reactRoot.render(
    <AuthProvider>
      <BrowserRouter>
        <App
          isSignedIn={isSignedIn}
          accountId={accountId}
          contract={contract}
          wallet={wallet}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};
