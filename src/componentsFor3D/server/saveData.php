<?php
$servername = "localhost:3306";
$username = "tuvval_user";
$password = "Tuvval%2024";
$dbname = "tuvv_designer";

$conn = new mysqli($servername, $username, $password, $dbname);

// Güvenlik önlemleri: Bağlantı hatası kontrolü
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$jsonData = json_decode(file_get_contents("php://input"), true);

// Extracting data from JSON
$designer = isset($jsonData['designer']) ? $jsonData['designer'] : NULL;
$user = isset($jsonData['user']) ? $jsonData['user'] : NULL;
$date = isset($jsonData['date']) ? $jsonData['date'] : NULL;
$time = isset($jsonData['time']) ? $jsonData['time'] : NULL;
$product = isset($jsonData['product']) ? $jsonData['product'] : NULL;
$colors = isset($jsonData['colors']) ? $jsonData['colors'] : NULL;
$assets = isset($jsonData['assets']) ? $jsonData['assets'] : NULL;
$lastactivity = isset($jsonData['lastactivity']) ? $jsonData['lastactivity'] : NULL;

// Güvenlik önlemleri: SQL sorgusunu hazırlama
$stmt = $conn->prepare("INSERT INTO designs (designer, user, date, time, product, colors, assets, lastactivity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssss", $designer, $user, $date, $time, $product, $colors, $assets, $lastactivity);

// Güvenlik önlemleri: Sorguyu çalıştırma
if ($stmt->execute()) {
    echo "Data inserted successfully";
} else {
    echo "Error: " . $stmt->error;
}
$stmt->close();
$conn->close();
?>

