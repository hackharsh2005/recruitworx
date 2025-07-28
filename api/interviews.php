<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
session_start();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getInterviews($db);
        break;
    case 'POST':
        scheduleInterview($db);
        break;
    case 'PUT':
        updateInterview($db);
        break;
}

function getInterviews($db) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Please login']);
        return;
    }
    
    if ($_SESSION['role'] === 'candidate') {
        // Get interviews for candidate
        $query = "SELECT i.*, a.job_id, j.title as job_title, u.full_name as hr_name
                  FROM interviews i
                  JOIN applications a ON i.application_id = a.id
                  JOIN jobs j ON a.job_id = j.id
                  JOIN users u ON j.created_by = u.id
                  WHERE a.user_id = ?
                  ORDER BY i.interview_date ASC";
        $stmt = $db->prepare($query);
        $stmt->execute([$_SESSION['user_id']]);
    } else {
        // Get all interviews for HR/Admin
        $query = "SELECT i.*, a.job_id, j.title as job_title, u.full_name as candidate_name, u.email as candidate_email
                  FROM interviews i
                  JOIN applications a ON i.application_id = a.id
                  JOIN jobs j ON a.job_id = j.id
                  JOIN users u ON a.user_id = u.id
                  ORDER BY i.interview_date ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
    }
    
    $interviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'interviews' => $interviews]);
}

function scheduleInterview($db) {
    if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'hr'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required = ['application_id', 'interview_date', 'location'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
            return;
        }
    }
    
    // Check if interview already exists for this application
    $query = "SELECT id FROM interviews WHERE application_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$data['application_id']]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Interview already scheduled for this application']);
        return;
    }
    
    $query = "INSERT INTO interviews (application_id, interview_date, location, notes) VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data['application_id'],
        $data['interview_date'],
        $data['location'],
        $data['notes'] ?? null
    ])) {
        // Update application status to interviewed
        $updateQuery = "UPDATE applications SET status = 'interviewed' WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$data['application_id']]);
        
        echo json_encode(['success' => true, 'message' => 'Interview scheduled successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to schedule interview']);
    }
}

function updateInterview($db) {
    if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'hr'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $interview_id = $data['id'] ?? null;
    
    if (!$interview_id) {
        echo json_encode(['success' => false, 'message' => 'Interview ID is required']);
        return;
    }
    
    $query = "UPDATE interviews SET interview_date = ?, location = ?, notes = ?, status = ?, 
              feedback = ?, rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data['interview_date'] ?? null,
        $data['location'] ?? null,
        $data['notes'] ?? null,
        $data['status'] ?? 'scheduled',
        $data['feedback'] ?? null,
        $data['rating'] ?? null,
        $interview_id
    ])) {
        echo json_encode(['success' => true, 'message' => 'Interview updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update interview']);
    }
}
?>