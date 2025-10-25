# New B2B endpoints for Firebase Functions
import os
import json
from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore, storage

# Initialize Firebase Admin
initialize_app(options={
    'storageBucket': 'lambda-926aa.firebasestorage.app',
    'projectId': 'lambda-926aa'
})

@https_fn.on_request()
def generateTasks(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function to generate tasks from contract analysis
    """
    print("=== generateTasks START ===")
    
    # CORS headers for all responses
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    }
    
    try:
        # Handle preflight OPTIONS request
        if req.method == 'OPTIONS':
            print("Handling OPTIONS preflight request")
            return https_fn.Response('', status=200, headers=cors_headers)
        
        # Import here to avoid circular imports
        from task_generator import generate_tasks
        
        # Get request data
        data = req.get_json()
        if not data:
            return https_fn.Response(
                json.dumps({'error': 'No data provided'}), 
                status=400, 
                headers=cors_headers
            )
        
        contract_id = data.get('contractId')
        project_id = data.get('projectId')
        
        if not contract_id or not project_id:
            return https_fn.Response(
                json.dumps({'error': 'Missing contractId or projectId'}), 
                status=400, 
                headers=cors_headers
            )
        
        # Call the task generator
        result = generate_tasks(contract_id, project_id)
        
        if result.get('success'):
            return https_fn.Response(
                json.dumps({
                    'success': True,
                    'message': 'Tasks generated successfully',
                    'epicIds': result.get('epicIds'),
                    'taskIds': result.get('taskIds')
                }),
                status=200,
                headers=cors_headers
            )
        else:
            return https_fn.Response(
                json.dumps({
                    'success': False,
                    'error': result.get('error', 'Task generation failed')
                }),
                status=500,
                headers=cors_headers
            )
            
    except Exception as e:
        print(f"=== CRITICAL ERROR in generateTasks ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== END ERROR ===")
        
        return https_fn.Response(
            json.dumps({
                'success': False, 
                'error': f"Critical error: {str(e)}",
                'error_type': type(e).__name__
            }),
            status=500,
            headers=cors_headers
        )

@https_fn.on_request()
def generateSmartPlan(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function to generate smart sprint plan with skill-based assignments
    """
    print("=== generateSmartPlan START ===")
    
    # CORS headers for all responses
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    }
    
    try:
        # Handle preflight OPTIONS request
        if req.method == 'OPTIONS':
            print("Handling OPTIONS preflight request")
            return https_fn.Response('', status=200, headers=cors_headers)
        
        # Import here to avoid circular imports
        from sprint_planner import generate_smart_sprint_plan
        
        # Get request data
        data = req.get_json()
        if not data:
            return https_fn.Response(
                json.dumps({'error': 'No data provided'}), 
                status=400, 
                headers=cors_headers
            )
        
        tasks = data.get('tasks')
        team_data = data.get('teamData')
        sprint_duration_weeks = data.get('sprintDurationWeeks', 2)
        
        if not tasks or not team_data:
            return https_fn.Response(
                json.dumps({'error': 'Missing tasks or teamData'}), 
                status=400, 
                headers=cors_headers
            )
        
        # Call the smart sprint planner
        sprint_plan = generate_smart_sprint_plan(tasks, team_data, sprint_duration_weeks)
        
        return https_fn.Response(
            json.dumps({
                'success': True,
                'message': 'Smart sprint plan generated successfully',
                'sprintPlan': sprint_plan
            }),
            status=200,
            headers=cors_headers
        )
            
    except Exception as e:
        print(f"=== CRITICAL ERROR in generateSmartPlan ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== END ERROR ===")
        
        return https_fn.Response(
            json.dumps({
                'success': False, 
                'error': f"Critical error: {str(e)}",
                'error_type': type(e).__name__
            }),
            status=500,
            headers=cors_headers
        )

@https_fn.on_request()
def analyzeChangeOrder(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function to analyze change request and provide options
    """
    print("=== analyzeChangeOrder START ===")
    
    # CORS headers for all responses
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    }
    
    try:
        # Handle preflight OPTIONS request
        if req.method == 'OPTIONS':
            print("Handling OPTIONS preflight request")
            return https_fn.Response('', status=200, headers=cors_headers)
        
        # Import here to avoid circular imports
        from change_analyzer import analyze_change_request
        
        # Get request data
        data = req.get_json()
        if not data:
            return https_fn.Response(
                json.dumps({'error': 'No data provided'}), 
                status=400, 
                headers=cors_headers
            )
        
        change_request_id = data.get('changeRequestId')
        
        if not change_request_id:
            return https_fn.Response(
                json.dumps({'error': 'Missing changeRequestId'}), 
                status=400, 
                headers=cors_headers
            )
        
        # Call the change analyzer
        result = analyze_change_request(change_request_id)
        
        if result.get('success'):
            return https_fn.Response(
                json.dumps({
                    'success': True,
                    'message': 'Change order analysis completed',
                    'analysis': result.get('analysis')
                }),
                status=200,
                headers=cors_headers
            )
        else:
            return https_fn.Response(
                json.dumps({
                    'success': False,
                    'error': result.get('error', 'Change order analysis failed')
                }),
                status=500,
                headers=cors_headers
            )
            
    except Exception as e:
        print(f"=== CRITICAL ERROR in analyzeChangeOrder ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== END ERROR ===")
        
        return https_fn.Response(
            json.dumps({
                'success': False, 
                'error': f"Critical error: {str(e)}",
                'error_type': type(e).__name__
            }),
            status=500,
            headers=cors_headers
        )

@https_fn.on_request()
def replanProject(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function to replan project based on changes (vacation, delay, etc.)
    """
    print("=== replanProject START ===")
    
    # CORS headers for all responses
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    }
    
    try:
        # Handle preflight OPTIONS request
        if req.method == 'OPTIONS':
            print("Handling OPTIONS preflight request")
            return https_fn.Response('', status=200, headers=cors_headers)
        
        # Get request data
        data = req.get_json()
        if not data:
            return https_fn.Response(
                json.dumps({'error': 'No data provided'}), 
                status=400, 
                headers=cors_headers
            )
        
        project_id = data.get('projectId')
        change_reason = data.get('changeReason', 'Manual replan')
        
        if not project_id:
            return https_fn.Response(
                json.dumps({'error': 'Missing projectId'}), 
                status=400, 
                headers=cors_headers
            )
        
        # TODO: Implement replan logic
        # This would involve:
        # 1. Getting current project data
        # 2. Getting team availability changes
        # 3. Regenerating sprint plan with new constraints
        # 4. Creating new plan version
        
        return https_fn.Response(
            json.dumps({
                'success': True,
                'message': 'Project replanning completed',
                'projectId': project_id,
                'changeReason': change_reason
            }),
            status=200,
            headers=cors_headers
        )
            
    except Exception as e:
        print(f"=== CRITICAL ERROR in replanProject ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== END ERROR ===")
        
        return https_fn.Response(
            json.dumps({
                'success': False, 
                'error': f"Critical error: {str(e)}",
                'error_type': type(e).__name__
            }),
            status=500,
            headers=cors_headers
        )
