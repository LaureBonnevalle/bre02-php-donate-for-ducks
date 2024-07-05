/* global Stripe */
/* global stripe */
/* global fetch */
/* global URLSearchParams */



// Initialisez une instance de Stripe avec votre clé publique de test
const stripe = Stripe('pk_test_51PZ7usRwPpR3xpZKA7GML6TPZeE8k06FJNvF8hLFblVNCQRKl2S73aRgy7nb5wuMDyVGnaz8upyle8s6IEYO6QII00WCH3YcTd');
//En lieu et place des lignes : 
//```javascript
//let amount;
//initialize();
//```
//Comportements attendu :
//- Lorsque le montant change, mettez à jour la valeur de la variable `amount` avec le nouveau montant choisi.
//- Si le montant est égal ou supérieur à 1€, appelez la fonction "initialize()" à ce moment précis de l'exécution.

let amount = 0; // Initialisez la variable 'amount'

// Supposons que 'input' est l'élément HTML où l'utilisateur entre le montant
let input = document.getElementById('montant-personnalise');

// Ajoutez un gestionnaire d'événements 'change' à l'élément 'input'
input.addEventListener('change', (event) => {
    // Mettez à jour la valeur de 'amount' avec le nouveau montant entré par l'utilisateur
    amount = event.target.value;
    
    if (amount >= 1) {
        initialize();
    }
    
});

let elements;

checkStatus();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize() {
  const { clientSecret } = await fetch("../app/controllers/create.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  }).then((r) => r.json());

  elements = stripe.elements({ clientSecret });

  const paymentElementOptions = {
    layout: "tabs",
  };

  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");
  
  const buttonSubmit = document.querySelector('form#payment-form button#submit');
  buttonSubmit.disabled = false;
  buttonSubmit.querySelector("#button-text").textContent = "Don de " + amount + "€";
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: "https://laurebonnevalle.sites.3wa.io/PHP_Paiement/bre02-php-donate-for-ducks/public/index.php",
    },
  });

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message);
  } else {
    showMessage("An unexpected error occurred.");
  }

  setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}