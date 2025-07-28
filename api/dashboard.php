<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Please login']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$role = $_SESSION['role'];

if ($role === 'candidate') {
    getCandidateDashboard($db);
} else {
    getHRDashboard($db);
}

function getCandidateDashboard($db) {
    $user_id = $_SESSION['user_id'];
    
    // Get application statistics
    $stats = [];
    
    // Total applications
    $query = "SELECT COUNT(*) as total FROM applications WHERE user_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    $stats['total_applications'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Applications by status
    $query = "SELECT status, COUNT(*) as count FROM applications WHERE user_id = ? GROUP BY status";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    $statusCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($statusCounts as $status) {
        $stats[$status['status']] = $status['count'];
    }
    
    // Recent applications
    $query = "SELECT a.*, j.title, j.location, j.job_type 
              FROM applications a 
              JOIN jobs j ON a.job_id = j.id 
              WHERE a.user_id = ? 
              ORDER BY a.applied_at DESC 
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    $recent_applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Upcoming interviews
    $query = "SELECT i.*, j.title as job_title 
              FROM interviews i 
              JOIN applications a ON i.application_id = a.id 
              JOIN jobs j ON a.job_id = j.id 
              WHERE a.user_id = ? AND i.interview_date > NOW() AND i.status = 'scheduled'
              ORDER BY i.interview_date ASC";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    $upcoming_interviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'recent_applications' => $recent_applications,
        'upcoming_interviews' => $upcoming_interviews
    ]);
}

function getHRDashboard($db) {
    $stats = [];
    
    // Total jobs
    $query = "SELECT COUNT(*) as total FROM jobs WHERE status = 'active'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_jobs'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Total applications
    $query = "SELECT COUNT(*) as total FROM applications";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_applications'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Applications by status
    $query = "SELECT status, COUNT(*) as count FROM applications GROUP BY status";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $statusCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($statusCounts as $status) {
        $stats[$status['status']] = $status['count'];
    }
    
    // Recent applications
    $query = "SELECT a.*, u.full_name, u.email, j.title as job_title 
              FROM applications a 
              JOIN users u ON a.user_id = u.id 
              JOIN jobs j ON a.job_id = j.id 
              ORDER BY a.applied_at DESC 
              LIMIT 10";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $recent_applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Upcoming interviews
    $query = "SELECT i.*, u.full_name as candidate_name, j.title as job_title 
              FROM interviews i 
              JOIN applications a ON i.application_id = a.id 
              JOIN users u ON a.user_id = u.id 
              JOIN jobs j ON a.job_id = j.id 
              WHERE i.interview_date > NOW() AND i.status = 'scheduled'
              ORDER BY i.interview_date ASC 
              LIMIT 10";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $upcoming_interviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Jobs with most applications
    $query = "SELECT j.title, COUNT(a.id) as application_count 
              FROM jobs j 
              LEFT JOIN applications a ON j.id = a.job_id 
              WHERE j.status = 'active'
              GROUP BY j.id, j.title 
              ORDER BY application_count DESC 
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $popular_jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'recent_applications' => $recent_applications,
        'upcoming_interviews' => $upcoming_interviews,
        'popular_jobs' => $popular_jobs
    ]);
}
?>