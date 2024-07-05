<?php

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__."/../../config/");
$dotenv->load();


$stripe = new \Stripe\StripeClient($_ENV["STRIPE_SECRET_KEY"]);
  //  $intent = $stripe->paymentIntents->create(
    //  [
    //    'amount' => 4200,
    //    'currency' => 'eur',
   //   ]
   // );
    
// Initialisez la variable
//$donation_amount = 0;

// Vérifiez si la requête AJAX a été envoyée
//if(isset($_POST['donation_personnalise'])) 
//{
//    $donation_amount = $_POST['donation_personnalise'];
    
//}

function calculateDonationAmount(int $amount): int {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent (htmlspecialchars)
    // people from directly manipulating the amount on the client
    //return 1400;
    $safeAmount = htmlspecialchars($amount);
// les calculs se font en centimes pour ne pas etre embetes par les pb de virgules
    return $safeAmount * 100;
}

header('Content-Type: application/json');

try {
    // retrieve JSON from POST body
    $jsonStr = file_get_contents('php://input');
    $jsonObj = json_decode($jsonStr, true);

    $amount = $jsonObj['amount'];
    // TODO : Create a PaymentIntent with amount and currency in '$paymentIntent'
    //echo ($jsonObj["amount"]);
    
    $amount = calculateDonationAmount($amount);
    
    $paymentIntent = $stripe->paymentIntents->create(
      [
        'amount' => $amount,
        'currency' => 'eur',
      ]
    );
    

    $output = [
        'clientSecret' => $paymentIntent->client_secret,
    ];

    echo json_encode($output);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

