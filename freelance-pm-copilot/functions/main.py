import os
import json
import tempfile
from firebase_functions import https_fn, firestore_fn
from firebase_admin import initialize_app, firestore, storage
import requests

# Initialize Firebase Admin
try:
    initialize_app(options={'storageBucket': 'lambda-926aa.firebasestorage.app'})
except ValueError:
    # App already initialized
    pass

@https_fn.on_request()
def analyzeContract(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function to analyze contract PDF using AI
    """
    print("=== analyzeContract START ===")
    
    try:
        # Log request details
        print(f"Request method: {req.method}")
        print(f"Request headers: {dict(req.headers)}")
        
        # Import here to avoid circular imports
        print("Importing contract_analyzer...")
        from contract_analyzer import analyze_contract
        print("contract_analyzer imported successfully")
        
        # Get request data
        print("Parsing request JSON...")
        data = req.get_json()
        print(f"Request data: {data}")
        
        if not data:
            print("ERROR: No data provided")
            return https_fn.Response("No data provided", status=400)
        
        contract_id = data.get('contractId')
        pdf_url = data.get('pdfUrl')
        pdf_path = data.get('pdfPath')
        
        print(f"Contract ID: {contract_id}")
        print(f"PDF URL: {pdf_url}")
        print(f"PDF Path: {pdf_path}")
        
        if not contract_id or not (pdf_url or pdf_path):
            print("ERROR: Missing contractId or PDF reference")
            return https_fn.Response("Missing contractId or PDF reference", status=400)
        
        # Call the contract analyzer
        print("Calling analyze_contract...")
        analysis_result = analyze_contract(contract_id, pdf_url, pdf_path)
        print(f"Analysis result: {analysis_result}")
        
        if analysis_result.get('success'):
            print("Analysis completed successfully")
            return https_fn.Response(
                json.dumps({
                    'success': True,
                    'message': 'Contract analysis completed',
                    'contractId': contract_id
                }),
                status=200,
                headers={'Content-Type': 'application/json'}
            )
        else:
            print(f"Analysis failed: {analysis_result.get('error', 'Unknown error')}")
            return https_fn.Response(
                json.dumps({
                    'success': False,
                    'error': analysis_result.get('error', 'Analysis failed')
                }),
                status=500,
                headers={'Content-Type': 'application/json'}
            )
            
    except Exception as e:
        print(f"=== CRITICAL ERROR in analyzeContract ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Error details: {repr(e)}")
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
            headers={'Content-Type': 'application/json'}
        )

@https_fn.on_request()
def generateSprintPlan(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function to generate sprint plan for a contract
    """
    try:
        # Import here to avoid circular imports
        from sprint_planner import generate_sprint_plan
        
        # Get request data
        data = req.get_json()
        if not data:
            return https_fn.Response("No data provided", status=400)
        
        contract_id = data.get('contractId')
        sprint_duration_weeks = data.get('sprintDurationWeeks', 2)
        
        if not contract_id:
            return https_fn.Response("Missing contractId", status=400)
        
        # Call the sprint planner
        plan_result = generate_sprint_plan(contract_id, sprint_duration_weeks)
        
        if plan_result.get('success'):
            return https_fn.Response(
                json.dumps({
                    'success': True,
                    'message': 'Sprint plan generated successfully',
                    'planId': plan_result.get('planId')
                }),
                status=200,
                headers={'Content-Type': 'application/json'}
            )
        else:
            return https_fn.Response(
                json.dumps({
                    'success': False,
                    'error': plan_result.get('error', 'Sprint plan generation failed')
                }),
                status=500,
                headers={'Content-Type': 'application/json'}
            )
            
    except Exception as e:
        print(f"Error in generateSprintPlan: {str(e)}")
        return https_fn.Response(
            json.dumps({'success': False, 'error': str(e)}),
            status=500,
            headers={'Content-Type': 'application/json'}
        )
