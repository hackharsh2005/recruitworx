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
        if ($action === 'search') {
            searchJobs($db);
        } else {
            getJobs($db);
        }
        break;
    case 'POST':
        if ($action === 'apply') {
            applyToJob($db);
        } else {
            createJob($db);
        }
        break;
    case 'PUT':
        updateJob($db);
        break;
    case 'DELETE':
        deleteJob($db);
        break;
}

function getJobs($db) {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $query = "SELECT j.*, u.full_name as created_by_name, 
                  (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
                  FROM jobs j 
                  LEFT JOIN users u ON j.created_by = u.id 
                  WHERE j.id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $job = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($job) {
            echo json_encode(['success' => true, 'job' => $job]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Job not found']);
        }
    } else {
        $query = "SELECT j.*, u.full_name as created_by_name,
                  (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
                  FROM jobs j 
                  LEFT JOIN users u ON j.created_by = u.id 
                  WHERE j.status = 'active'
                  ORDER BY j.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'jobs' => $jobs]);
    }
}

function searchJobs($db) {
    $search = $_GET['search'] ?? '';
    $location = $_GET['location'] ?? '';
    $job_type = $_GET['job_type'] ?? '';
    
    $query = "SELECT j.*, u.full_name as created_by_name,
              (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
              FROM jobs j 
              LEFT JOIN users u ON j.created_by = u.id 
              WHERE j.status = 'active'";
    $params = [];
    
    if (!empty($search)) {
        $query .= " AND (j.title LIKE ? OR j.description LIKE ? OR j.required_skills LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    if (!empty($location)) {
        $query .= " AND j.location LIKE ?";
        $params[] = "%$location%";
    }
    
    if (!empty($job_type)) {
        $query .= " AND j.job_type = ?";
        $params[] = $job_type;
    }
    
    $query .= " ORDER BY j.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'jobs' => $jobs]);
}

function createJob($db) {
    if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'hr'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required = ['title', 'description', 'location', 'job_type'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
            return;
        }
    }
    
    $query = "INSERT INTO jobs (title, description, location, job_type, salary_range, required_skills, deadline, created_by) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data['title'],
        $data['description'],
        $data['location'],
        $data['job_type'],
        $data['salary_range'] ?? null,
        $data['required_skills'] ?? null,
        $data['deadline'] ?? null,
        $_SESSION['user_id']
    ])) {
        echo json_encode(['success' => true, 'message' => 'Job created successfully', 'job_id' => $db->lastInsertId()]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create job']);
    }
}

function applyToJob($db) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Please login to apply']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $job_id = $data['job_id'] ?? null;
    $cover_letter = $data['cover_letter'] ?? '';
    
    if (!$job_id) {
        echo json_encode(['success' => false, 'message' => 'Job ID is required']);
        return;
    }
    
    // Check if already applied
    $query = "SELECT id FROM applications WHERE job_id = ? AND user_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$job_id, $_SESSION['user_id']]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'You have already applied to this job']);
        return;
    }
    
    // Apply to job
    $query = "INSERT INTO applications (job_id, user_id, cover_letter) VALUES (?, ?, ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([$job_id, $_SESSION['user_id'], $cover_letter])) {
        echo json_encode(['success' => true, 'message' => 'Application submitted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to submit application']);
    }
}

function updateJob($db) {
    if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'hr'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $job_id = $data['id'] ?? null;
    
    if (!$job_id) {
        echo json_encode(['success' => false, 'message' => 'Job ID is required']);
        return;
    }
    
    $query = "UPDATE jobs SET title = ?, description = ?, location = ?, job_type = ?, 
              salary_range = ?, required_skills = ?, deadline = ?, updated_at = CURRENT_TIMESTAMP 
              WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data['title'],
        $data['description'],
        $data['location'],
        $data['job_type'],
        $data['salary_range'] ?? null,
        $data['required_skills'] ?? null,
        $data['deadline'] ?? null,
        $job_id
    ])) {
        echo json_encode(['success' => true, 'message' => 'Job updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update job']);
    }
}

function deleteJob($db) {
    if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'hr'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }
    
    $job_id = $_GET['id'] ?? null;
    
    if (!$job_id) {
        echo json_encode(['success' => false, 'message' => 'Job ID is required']);
        return;
    }
    
    $query = "DELETE FROM jobs WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([$job_id])) {
        echo json_encode(['success' => true, 'message' => 'Job deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete job']);
    }
}
?>