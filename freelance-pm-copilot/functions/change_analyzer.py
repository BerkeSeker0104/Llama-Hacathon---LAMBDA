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

CHANGE_ORDER_PROMPT = """
Sen, değişiklik taleplerini analiz eden uzman bir proje yöneticisisin.

Görevin:
1. Talebin bug/minor/major scope change olduğunu belirle
2. Etki analizi yap (zaman, maliyet, kaynak)
3. 3 seçenek sun: (a) Timeline uzat, (b) Descope yap, (c) Sabit bütçe-kısmi kabul

Çıktı formatı:
{
  "classification": "bug" | "minor_scope" | "major_scope" | "out_of_scope",
  "impactAnalysis": {
    "timeDays": 5,
    "costEstimate": "$2000",
    "affectedTasks": ["task_3", "task_5"],
    "affectedSprints": [2, 3]
  },
  "options": [
    {
      "id": 1,
      "title": "Timeline Uzatma",
      "description": "5 gün ek süre, tüm özellikler",
      "timeline": "+5 gün",
      "cost": "$2000",
      "pros": ["Tüm özellikler korunur", "Kalite garantisi"],
      "cons": ["Proje gecikir", "Ek maliyet"]
    },
    {
      "id": 2,
      "title": "Descope Yapma",
      "description": "Bazı özellikler çıkarılır, zaman korunur",
      "timeline": "Sabit",
      "cost": "Sabit",
      "pros": ["Zaman korunur", "Maliyet sabit"],
      "cons": ["Özellik kaybı", "Müşteri memnuniyetsizliği"]
    },
    {
      "id": 3,
      "title": "Sabit Bütçe - Kısmi Kabul",
      "description": "Sadece kritik kısım yapılır",
      "timeline": "Sabit",
      "cost": "Sabit",
      "pros": ["Bütçe korunur", "Zaman korunur"],
      "cons": ["Kısıtlı özellik", "Gelecekte ek iş"]
    }
  ],
  "recommendation": 1
}
"""

def analyze_change_order(change_request_text, current_project_data=None):
    """
    Analyze change request and provide options
    """
    try:
        # Prepare project context if available
        project_context = ""
        if current_project_data:
            project_context = f"""
Mevcut Proje Bilgileri:
- Proje Adı: {current_project_data.get('name', 'Bilinmiyor')}
- Durum: {current_project_data.get('status', 'Bilinmiyor')}
- Başlangıç: {current_project_data.get('startDate', 'Bilinmiyor')}
- Bitiş: {current_project_data.get('endDate', 'Bilinmiyor')}
"""
        
        # User prompt with change request
        USER_PROMPT = f"""
Aşağıdaki değişiklik talebini analiz et:

{project_context}

Değişiklik Talebi:
{change_request_text}

Lütfen:
1. Talebin türünü belirle (bug, minor scope, major scope, out of scope)
2. Etki analizi yap (zaman, maliyet, etkilenen task'lar)
3. 3 farklı seçenek sun
4. Hangi seçeneği önerdiğini belirt

Sadece yukarıdaki JSON formatını döndür.
"""

        # Call Groq API
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": CHANGE_ORDER_PROMPT},
                {"role": "user", "content": USER_PROMPT}
            ],
            temperature=0.2,
            max_tokens=4096,
            response_format={"type": "json_object"}
        )
        
        json_string_response = completion.choices[0].message.content
        analysis_data = json.loads(json_string_response)
        
        print("Change order analysis completed successfully")
        return analysis_data

    except Exception as e:
        print(f"Error analyzing change order: {str(e)}")
        raise

def save_change_analysis_to_firestore(change_request_id, analysis_data):
    """
    Save change analysis to Firestore
    """
    try:
        # Update change request with analysis
        change_request_ref = db.collection('changeRequests').document(change_request_id)
        change_request_ref.update({
            'analysis': analysis_data,
            'status': 'analyzed',
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        print(f"Change analysis saved to Firestore for change request {change_request_id}")
        return True
        
    except Exception as e:
        print(f"Error saving change analysis to Firestore: {str(e)}")
        raise

def analyze_change_request(change_request_id):
    """
    Main function to analyze change request
    """
    try:
        print(f"Starting change request analysis for {change_request_id}")
        
        # Step 1: Get change request from Firestore
        print("Getting change request from Firestore...")
        change_request_ref = db.collection('changeRequests').document(change_request_id)
        change_request_doc = change_request_ref.get()
        
        if not change_request_doc.exists:
            raise ValueError(f"Change request {change_request_id} not found")
        
        change_request_data = change_request_doc.to_dict()
        request_text = change_request_data.get('requestText', '')
        
        # Step 2: Get project data if available
        project_data = None
        if change_request_data.get('contractId'):
            contract_ref = db.collection('contracts').document(change_request_data['contractId'])
            contract_doc = contract_ref.get()
            if contract_doc.exists:
                contract_data = contract_doc.to_dict()
                # Get project data if available
                projects_ref = db.collection('projects')
                projects_query = projects_ref.where('contractId', '==', change_request_data['contractId']).limit(1)
                projects = projects_query.get()
                if projects:
                    project_data = projects[0].to_dict()
        
        # Step 3: Analyze change request with Groq
        print("Analyzing change request with Groq API...")
        analysis_data = analyze_change_order(request_text, project_data)
        
        # Step 4: Save to Firestore
        print("Saving analysis to Firestore...")
        save_change_analysis_to_firestore(change_request_id, analysis_data)
        
        print(f"Change request analysis completed successfully for {change_request_id}")
        return {
            'success': True,
            'changeRequestId': change_request_id,
            'analysis': analysis_data
        }
        
    except Exception as e:
        print(f"Change request analysis failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'changeRequestId': change_request_id
        }
