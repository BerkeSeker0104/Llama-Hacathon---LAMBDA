import os
import json
from groq import Groq
from firebase_admin import firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize clients
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
db = firestore.client()

def get_contract_analysis(contract_id):
    """
    Get contract analysis from Firestore
    """
    try:
        contract_ref = db.collection('contracts').document(contract_id)
        contract_doc = contract_ref.get()
        
        if not contract_doc.exists:
            raise ValueError(f"Contract {contract_id} not found")
        
        contract_data = contract_doc.to_dict()
        analysis = contract_data.get('analysis')
        
        if not analysis:
            raise ValueError(f"No analysis found for contract {contract_id}")
        
        return analysis
        
    except Exception as e:
        print(f"Error getting contract analysis: {str(e)}")
        raise

def generate_sprint_plan_with_groq(contract_analysis, sprint_duration_weeks=2):
    """
    Generate sprint plan using Groq API
    """
    try:
        # Prepare data for Groq
        deliverables = json.dumps(contract_analysis.get("deliverables", []), ensure_ascii=False, indent=2)
        milestones = json.dumps(contract_analysis.get("milestones", []), ensure_ascii=False, indent=2)
        risks = json.dumps(contract_analysis.get("risks", []), ensure_ascii=False, indent=2)
        
        # Sprint planning system prompt
        SPRINT_SYSTEM_PROMPT = f"""
Sen, deneyimli bir Mobil Uygulama Proje Yöneticisi ve Scrum Master'sın.
Görevin, sana verilen proje kapsamı ve teslimat listesine dayanarak, projeyi {sprint_duration_weeks} haftalık mantıklı sprint'lere bölmek ve her sprint için spesifik, teknik görevler (task) oluşturmaktır.
Çıktın SADECE ve SADECE aşağıdaki JSON formatında bir dizi (array) olmalıdır. Başka hiçbir açıklama yapma.

[
  {{
    "sprint_num": 1,
    "sprint_hedefi": "Sprint 1 için net bir hedef cümlesi.",
    "gorevler": [
      "Sprint 1'de yapılacak spesifik bir görev (örn: 'API tasarımı ve veritabanı şeması').",
      "Sprint 1'de yapılacak başka bir görev (örn: 'Kullanıcı giriş/kayıt UI tasarımı')."
    ]
  }},
  {{
    "sprint_num": 2,
    "sprint_hedefi": "...",
    "gorevler": [ "..." ]
  }}
]
"""
        
        # User prompt with contract data
        USER_PROMPT = f"""
Lütfen aşağıdaki proje bilgileri için bir sprint planı oluştur:

Proje Kapsamı:
{contract_analysis.get('summary', '')}

Ana Teslimatlar Listesi:
{deliverables}

Kilometre Taşları:
{milestones}

Riskler:
{risks}

Talimat: Bu projeyi {sprint_duration_weeks} haftalık mantıklı sprint'lere böl ve sistem talimatlarında belirtilen JSON formatında bir plan çıkar.
"""

        # Call Groq API
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SPRINT_SYSTEM_PROMPT},
                {"role": "user", "content": USER_PROMPT}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        json_string_response = completion.choices[0].message.content
        sprint_plan_data = json.loads(json_string_response)
        
        # Handle different response formats
        sprint_plan = sprint_plan_data
        if isinstance(sprint_plan_data, dict) and len(sprint_plan_data) == 1:
            sprint_plan = list(sprint_plan_data.values())[0]
        
        print("Sprint plan generated successfully")
        return sprint_plan
        
    except Exception as e:
        print(f"Error generating sprint plan with Groq: {str(e)}")
        raise

def save_sprint_plan_to_firestore(contract_id, sprint_plan, sprint_duration_weeks):
    """
    Save sprint plan to Firestore
    """
    try:
        # Convert sprint plan to our schema format
        sprints = []
        for sprint in sprint_plan:
            sprint_obj = {
                'id': f"sprint_{sprint['sprint_num']}",
                'name': f"Sprint {sprint['sprint_num']}",
                'startDate': '',  # Will be calculated based on project start
                'endDate': '',    # Will be calculated based on sprint duration
                'tasks': [],
                'status': 'planned'
            }
            
            # Convert tasks
            for i, task_desc in enumerate(sprint['gorevler']):
                task = {
                    'id': f"sprint_{sprint['sprint_num']}_task_{i+1}",
                    'title': task_desc,
                    'description': task_desc,
                    'status': 'todo',
                    'assignee': '',
                    'estimatedHours': None,
                    'actualHours': None,
                    'dueDate': None,
                    'completedAt': None
                }
                sprint_obj['tasks'].append(task)
            
            sprints.append(sprint_obj)
        
        # Create plan document
        plan_data = {
            'contractId': contract_id,
            'userId': '',  # Will be set from contract
            'version': 1,
            'title': f'Sprint Plan - {sprint_duration_weeks} weeks',
            'sprints': sprints,
            'timeline': {
                'optimistic': '',
                'realistic': '',
                'pessimistic': ''
            },
            'status': 'draft',
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        
        # Save to Firestore
        plan_ref = db.collection('plans').add(plan_data)
        plan_id = plan_ref[1].id
        
        # Update contract with plan reference
        contract_ref = db.collection('contracts').document(contract_id)
        contract_ref.update({
            'planId': plan_id,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        print(f"Sprint plan saved with ID: {plan_id}")
        return plan_id
        
    except Exception as e:
        print(f"Error saving sprint plan: {str(e)}")
        raise

def generate_sprint_plan(contract_id, sprint_duration_weeks=2):
    """
    Main function to generate sprint plan
    """
    try:
        print(f"Starting sprint plan generation for contract {contract_id}")
        
        # Step 1: Get contract analysis
        print("Getting contract analysis...")
        contract_analysis = get_contract_analysis(contract_id)
        
        # Step 2: Generate sprint plan with Groq
        print("Generating sprint plan with Groq API...")
        sprint_plan = generate_sprint_plan_with_groq(contract_analysis, sprint_duration_weeks)
        
        # Step 3: Save to Firestore
        print("Saving sprint plan to Firestore...")
        plan_id = save_sprint_plan_to_firestore(contract_id, sprint_plan, sprint_duration_weeks)
        
        print(f"Sprint plan generation completed successfully for contract {contract_id}")
        return {
            'success': True,
            'contractId': contract_id,
            'planId': plan_id,
            'sprintPlan': sprint_plan
        }
        
    except Exception as e:
        print(f"Sprint plan generation failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'contractId': contract_id
        }
