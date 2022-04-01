import "regenerator-runtime/runtime";
import * as nearAPI from "near-api-js";
import getConfig from "./config";
const nearConfig = getConfig(process.env.NODE_ENV || "development");

async function connect(nearConfig) {
  // Connects to NEAR and provides `near`, `walletAccount` and `contract` objects in `window` scope
  // Initializing connection to the NEAR node.
  window.near = await nearAPI.connect({
    deps: {
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore()
    },
    ...nearConfig
  });

  // Needed to access wallet login
  window.walletConnection = new nearAPI.WalletConnection(window.near);

  // Initializing our contract APIs by contract name and configuration.
  window.contract = await new nearAPI.Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read-only – they don't modify the state, but usually return some value
    viewMethods: ['get_message'],
    // Change methods can modify the state, but you don't receive the returned value when called
    changeMethods: ['store_message'],
    // Sender is the account ID to initialize transactions.
    // getAccountId() will return empty string if user is still unauthorized
    sender: window.walletConnection.getAccountId()
  });
}

function errorHelper(err) {
  // if there's a cryptic error, provide more helpful feedback and instructions here
  // TODO: as soon as we get the error codes propagating back, use those
  if (err.message.includes('Cannot deserialize the contract state')) {
    console.warn('NEAR Warning: the contract/account seems to have state that is not (or no longer) compatible.\n' +
        'This may require deleting and recreating the NEAR account as shown here:\n' +
        'https://stackoverflow.com/a/60767144/711863');
  }
  if (err.message.includes('Cannot deserialize the contract state')) {
    console.warn('NEAR Warning: the contract/account seems to have state that is not (or no longer) compatible.\n' +
        'This may require deleting and recreating the NEAR account as shown here:\n' +
        'https://stackoverflow.com/a/60767144/711863');
  }
  console.error(err);
}

function updateUI() {
  if (!window.walletConnection.getAccountId()) {
    document.querySelector('.sign-in').style.display = 'block';
    document.querySelector('#form').style.display = 'none';
    document.querySelector('.sign-out').style.display = 'none';
  } else {
    document.querySelector('.sign-out').style.display = 'block';
    document.querySelector('#form').style.display = 'block';

    Array.from(document.querySelectorAll('.after-sign-in')).map(it => it.style = 'display: block;');
    var acc = document.querySelector('#myAccount')
    acc.disabled = true;
    acc.value = window.walletConnection.getAccountId();
    var msgTxt = document.querySelector('#newMessage');
    msgTxt.disabled = false;
    contract.get_message({ key: window.walletConnection.getAccountId()}).then(message => {  
      if (message != 'Message not found') {
        msgTxt.value = message;
        msgTxt.disabled = true;
        document.querySelector('#sendMessage').style.display = 'none';
      }
    }).catch(err => errorHelper(err));;
    document.querySelector('#sendMessage').addEventListener('click', () => {
      var msg = document.querySelector('#newMessage');
      msg.disabled = true;
      contract.store_message( { key: window.walletConnection.getAccountId(), value: msg.value }  , ).then(updateUI);
    });

    document.querySelector('#getMessage').addEventListener('click', () => {
      var msg = document.querySelector('#message').value;
      contract.get_message({ key: window.walletConnection.getAccountId()}).then(message => {  
        console.log("message", message);
      });
    });
    
  }
}


// Log in user using NEAR Wallet on "Sign In" button click
document.querySelector('.sign-in .btn').addEventListener('click', () => {
  walletConnection.requestSignIn(nearConfig.contractName, 'NEAR4ever');
});

document.querySelector('.sign-out').addEventListener('click', () => {
  walletConnection.signOut();
  window.location.replace(window.location.origin + window.location.pathname);
});

window.nearInitPromise = connect(nearConfig)
    .then(updateUI)
    .catch(console.error);
