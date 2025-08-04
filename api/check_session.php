<?php
session_start();
// api/check_session.php
require_once 'config.php';
require_once 'utils.php';

header("Content-Type: application/json; charset=UTF-8");

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    json_response(200, [
        'loggedIn' => true, 
        'username' => $_SESSION['admin_username'] ?? 'Admin'
    ]);
} else {
    json_response(401, ['loggedIn' => false]);
}
?> 