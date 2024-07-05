<?php


$dotenv = Dotenv\Dotenv::createImmutable(__DIR__/config);
$dotenv->load();

var_dump ('$dotenv');

$stripe = new \Stripe\StripeClient("API_KEY");
    $intent = $stripe->paymentIntents->create(
      [
        'amount' => 4200,
        'currency' => 'eur',
      ]
    );

function calculateOrderAmount(int $amount): int {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
}

header('Content-Type: application/json');

try {
    // retrieve JSON from POST body
    $jsonStr = file_get_contents('php://input');
    $jsonObj = json_decode($jsonStr);

    // TODO : Create a PaymentIntent with amount and currency in '$paymentIntent'

    $output = [
        'clientSecret' => $paymentIntent->client_secret,
    ];

    echo json_encode($output);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

