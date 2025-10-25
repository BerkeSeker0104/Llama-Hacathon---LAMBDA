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

TASK_GENERATION_PROMPT = """
Sen, proje kapsamını WBS (Work Breakdown Structure) ve task'lara dönüştüren uzman bir proje yöneticisisin.

Görevin, verilen deliverable'ları ve milestone'ları analiz edip, her birini executable task'lara bölmektir.

Çıktı formatı:
{
  "epics": [
    {
      "id": "epic_1",
      "title": "Epic başlığı (örn: 'Kullanıcı Yönetimi')",
      "description": "Epic açıklaması",
      "deliverableId": "del_1"
    }
  ],
  "tasks": [
    {
      "id": "task_1",
      "epicId": "epic_1",
      "title": "Task başlığı",
      "description": "Detaylı task açıklaması",
      "requiredSkills": ["Flutter", "Firebase"],
      "estimatedHours": 16,
      "acceptanceCriteria": ["Kriter 1", "Kriter 2"],
      "dependsOn": ["task_0"] // Bağımlılıklar
    }
  ]
}
"""

def generate_tasks_from_contract(contract_analysis):
    """
    Generate WBS and tasks from contract analysis
    """
    try:
        # Prepare contract data for Groq
        deliverables = json.dumps(contract_analysis.get("deliverables", []), ensure_ascii=False, indent=2)
        milestones = json.dumps(contract_analysis.get("milestones", []), ensure_ascii=False, indent=2)
        summary = contract_analysis.get("summary", "")
        
        # User prompt with contract data
        USER_PROMPT = f"""
Lütfen aşağıdaki proje bilgileri için WBS ve task listesi oluştur:

Proje Özeti:
{summary}

Teslimatlar:
{deliverables}

Kilometre Taşları:
{milestones}

Talimat: Her teslimatı mantıklı epic'lere böl, sonra her epic'i executable task'lara ayır. 
Task'lar için gerekli skill'leri, tahmini saatleri ve kabul kriterlerini belirle.
Bağımlılıkları da dikkate al.

Sadece yukarıdaki JSON formatını döndür.
"""

        # Call Groq API
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": TASK_GENERATION_PROMPT},
                {"role": "user", "content": USER_PROMPT}
            ],
            temperature=0.2,
            max_tokens=8192,
            response_format={"type": "json_object"}
        )
        
        json_string_response = completion.choices[0].message.content
        task_data = json.loads(json_string_response)
        
        print("Task generation completed successfully")
        return task_data
        
    except Exception as e:
        print(f"Error generating tasks: {str(e)}")
        raise

def save_tasks_to_firestore(contract_id, project_id, task_data):
    """
    Save generated tasks to Firestore
    """
    try:
        # Save epics
        epics = task_data.get("epics", [])
        epic_ids = {}
        
        for epic in epics:
            epic_ref = db.collection('epics').add({
                'contractId': contract_id,
                'projectId': project_id,
                'title': epic['title'],
                'description': epic['description'],
                'deliverableId': epic.get('deliverableId'),
                'createdAt': firestore.SERVER_TIMESTAMP
            })
            epic_ids[epic['id']] = epic_ref[1].id
        
        # Save tasks
        tasks = task_data.get("tasks", [])
        task_ids = {}
        
        for task in tasks:
            # Convert dependsOn to actual task IDs
            depends_on = []
            for dep_id in task.get('dependsOn', []):
                if dep_id in task_ids:
                    depends_on.append(task_ids[dep_id])
            
            task_ref = db.collection('tasks').add({
                'contractId': contract_id,
                'projectId': project_id,
                'epicId': epic_ids.get(task.get('epicId')),
                'title': task['title'],
                'description': task['description'],
                'requiredSkills': task.get('requiredSkills', []),
                'estimatedHours': task.get('estimatedHours', 0),
                'acceptanceCriteria': task.get('acceptanceCriteria', []),
                'dependsOn': depends_on,
                'status': 'todo',
                'createdAt': firestore.SERVER_TIMESTAMP
            })
            task_ids[task['id']] = task_ref[1].id
        
        print(f"Tasks saved to Firestore for contract {contract_id}")
        return {
            'epicIds': epic_ids,
            'taskIds': task_ids
        }
        
    except Exception as e:
        print(f"Error saving tasks to Firestore: {str(e)}")
        raise

def generate_tasks(contract_id, project_id):
    """
    Main function to generate tasks from contract
    """
    try:
        print(f"Starting task generation for contract {contract_id}")
        
        # Step 1: Get contract analysis
        print("Getting contract analysis...")
        contract_ref = db.collection('contracts').document(contract_id)
        contract_doc = contract_ref.get()
        
        if not contract_doc.exists:
            raise ValueError(f"Contract {contract_id} not found")
        
        contract_data = contract_doc.to_dict()
        analysis = contract_data.get('analysis')
        
        if not analysis:
            raise ValueError(f"No analysis found for contract {contract_id}")
        
        # Step 2: Generate tasks with Groq
        print("Generating tasks with Groq API...")
        task_data = generate_tasks_from_contract(analysis)
        
        # Step 3: Save to Firestore
        print("Saving tasks to Firestore...")
        result = save_tasks_to_firestore(contract_id, project_id, task_data)
        
        print(f"Task generation completed successfully for contract {contract_id}")
        return {
            'success': True,
            'contractId': contract_id,
            'projectId': project_id,
            'epicIds': result['epicIds'],
            'taskIds': result['taskIds'],
            'taskData': task_data
        }
        
    except Exception as e:
        print(f"Task generation failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'contractId': contract_id
        }
