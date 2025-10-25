import os
import json
import tempfile
from firebase_functions import https_fn, firestore_fn
from firebase_admin import initialize_app, firestore, storage
import requests

# Initialize Firebase Admin (only when needed)
def get_firestore_client():
    try:
        return firestore.client()
    except:
        initialize_app()
        return firestore.client()

@https_fn.on_request()
def analyzeContract(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function to analyze contract PDF using AI
    """
    try:
        # Import here to avoid circular imports
        from contract_analyzer import analyze_contract
        
        # Get request data
        data = req.get_json()
        if not data:
            return https_fn.Response("No data provided", status=400)
        
        contract_id = data.get('contractId')
        pdf_url = data.get('pdfUrl')
        
        if not contract_id or not pdf_url:
            return https_fn.Response("Missing contractId or pdfUrl", status=400)
        
        # Call the contract analyzer
        analysis_result = analyze_contract(contract_id, pdf_url)
        
        if analysis_result.get('success'):
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
            return https_fn.Response(
                json.dumps({
                    'success': False,
                    'error': analysis_result.get('error', 'Analysis failed')
                }),
                status=500,
                headers={'Content-Type': 'application/json'}
            )
            
    except Exception as e:
        print(f"Error in analyzeContract: {str(e)}")
        return https_fn.Response(
            json.dumps({'success': False, 'error': str(e)}),
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
