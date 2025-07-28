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
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'my-applications') {
            getMyApplications($db);
        } else {
            getApplications($db);
        }
        break;
    case 'PUT':
        updateApplicationStatus($db);
        break;
}

function getApplications($db) {
    if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'hr'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }
    
    $job_id = $_GET['job_id'] ?? null;
    
    $query = "SELECT a.*, u.full_name, u.email, u.phone, j.title as job_title,
              i.interview_date, i.location as interview_location, i.status as interview_status
              FROM applications a
              JOIN users u ON a.user_id = u.id
              JOIN jobs j ON a.job_id = j.id
              LEFT JOIN interviews i ON a.id = i.application_id
              WHERE 1=1";
    $params = [];
    
    if ($job_id) {
        $query .= " AND a.job_id = ?";
        $params[] = $job_id;
    }
    
    $query .= " ORDER BY a.applied_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'applications' => $applications]);
}

function getMyApplications($db) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Please login']);
        return;
    }
    
    $query = "SELECT a.*, j.title, j.location, j.job_type, j.salary_range,
              i.interview_date, i.location as interview_location, i.status as interview_status
              FROM applications a
              JOIN jobs j ON a.job_id = j.id
              LEFT JOIN interviews i ON a.id = i.application_id
              WHERE a.user_id = ?
              ORDER BY a.applied_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['user_id']]);
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'applications' => $applications]);
}

function updateApplicationStatus($db) {
    if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'hr'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $application_id = $data['application_id'] ?? null;
    $status = $data['status'] ?? null;
    
    if (!$application_id || !$status) {
        echo json_encode(['success' => false, 'message' => 'Application ID and status are required']);
        return;
    }
    
    $valid_statuses = ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected'];
    if (!in_array($status, $valid_statuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        return;
    }
    
    $query = "UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([$status, $application_id])) {
        echo json_encode(['success' => true, 'message' => 'Application status updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update application status']);
    }
}
?>