import os
import json
import tempfile
from groq import Groq
from llama_cloud_services import LlamaParse
from firebase_admin import firestore, storage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize clients
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
llama_api_key = os.environ.get("LLAMA_API_KEY")

# Initialize Firebase clients
db = firestore.client()
bucket = storage.bucket()

SYSTEM_PROMPT = """
Sen, freelancer sözleşmeleri konusunda uzman bir hukuk asistanısın.
Görevin, sana verilen sözleşme metnini analiz etmek ve SADECE ve SADECE 
istenen bilgileri içeren geçerli bir JSON nesnesi döndürmektir. 
Başka hiçbir açıklama, selamlama veya yorum yapma.

İstenen JSON yapısı şu şekilde olmalıdır:
{
  "summary": "Projenin genel kapsamının, temel hedeflerinin ve tarafların ana sorumluluklarının 1-2 cümlelik özeti.",
  "deliverables": [
    {
      "id": "del_1", 
      "title": "Teslimatın kısa başlığı (örn: 'Ana Sayfa Tasarımı')",
      "description": "Teslimatın metindeki açıklaması.",
      "acceptanceCriteria": "Teslimatın kabul edilmesi için gereken şart (örn: 'Mobil uyumlu olması', 'Tüm testleri geçmesi')"
    }
  ],
  "milestones": [
    {
      "id": "mil_1",
      "title": "Kilometre taşının adı (örn: 'Tasarım Aşaması', 'Beta Sürüm')",
      "dueDate": "YYYY-MM-DD formatında tarih (eğer metinde spesifik bir tarih varsa, yoksa null)"
    }
  ],
  "paymentPlan": [
    {
      "id": "pay_1",
      "amount": 5000, 
      "currency": "USD", 
      "dueDate": "YYYY-MM-DD formatında ödeme tarihi (eğer belirtilmişse, yoksa null)",
      "description": "Ödeme koşulu veya açıklaması (örn: 'Proje başlangıcında', 'İlk taslak tesliminde')"
    }
  ],
  "risks": [
    {
      "id": "risk_1",
      "title": "Riskin kısa başlığı (örn: 'Kapsam Kayması Riski', 'Belirsiz Kabul Kriterleri')",
      "severity": "low" | "medium" | "high",
      "description": "Riskin veya belirsiz maddenin açıklaması ve metindeki ilgili bölüm."
    }
  ],
  "timeline": {
    "optimistic": "YYYY-MM-DD (Metindeki bilgilere dayanarak tahmini en erken bitiş tarihi, bulunamazsa null)",
    "realistic": "YYYY-MM-DD (Metindeki bilgilere dayanarak tahmini gerçekçi bitiş tarihi, bulunamazsa null)",
    "pessimistic": "YYYY-MM-DD (Metindeki bilgilere dayanarak tahmini en geç bitiş tarihi, bulunamazsa null)"
  }
}
"""

def download_pdf_from_storage(pdf_url):
    """
    Download PDF from Firebase Storage to temporary file
    """
    try:
        # Extract bucket and file path from URL
        # URL format: https://firebasestorage.googleapis.com/v0/b/BUCKET_NAME/o/PATH%2FFILE.pdf?alt=media
        if 'firebasestorage.googleapis.com' not in pdf_url:
            raise ValueError("Invalid Firebase Storage URL")
        
        # Parse the URL to get the file path
        from urllib.parse import urlparse, unquote
        parsed_url = urlparse(pdf_url)
        path_parts = parsed_url.path.split('/')
        
        if len(path_parts) < 4:
            raise ValueError("Invalid Firebase Storage URL format")
        
        # Get the file path (everything after /o/)
        file_path = unquote(path_parts[3])
        
        # Download the file
        blob = bucket.blob(file_path)
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        blob.download_to_filename(temp_file.name)
        
        return temp_file.name
        
    except Exception as e:
        print(f"Error downloading PDF: {str(e)}")
        raise

def parse_pdf_with_llama(pdf_path):
    """
    Parse PDF using LlamaParse
    """
    try:
        parser = LlamaParse(
            api_key=llama_api_key,
            verbose=True,
            language="tr",  # Turkish language for better results
        )

        # Parse the PDF
        result = parser.parse(pdf_path)
        
        # Get text documents
        text_documents = result.get_text_documents(split_by_page=False)
        
        if text_documents:
            parsed_text = "\n".join([doc.text for doc in text_documents])
            print(f"PDF successfully parsed. Total {len(parsed_text)} characters found.")
            return parsed_text
        else:
            raise ValueError("Could not extract text from PDF")
            
    except Exception as e:
        print(f"LlamaParse error: {str(e)}")
        raise

def analyze_contract_with_groq(parsed_text):
    """
    Analyze contract text using Groq API
    """
    try:
        messages_to_groq = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": f"""Aşağıda bir dökümandan çıkarılmış metin bulunmaktadır. 
Lütfen bu metni sistem talimatlarında belirtilen JSON formatında analiz et:

--- METİN BAŞLANGICI ---
{parsed_text}
--- METİN SONU ---
"""
            }
        ]

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages_to_groq,
            temperature=0.0,
            max_tokens=4096,
            response_format={"type": "json_object"}
        )

        json_string_response = completion.choices[0].message.content
        analysis_data = json.loads(json_string_response)
        
        return analysis_data
        
    except Exception as e:
        print(f"Groq API error: {str(e)}")
        raise

def save_analysis_to_firestore(contract_id, analysis_data):
    """
    Save analysis results to Firestore
    """
    try:
        # Add analyzedAt timestamp
        analysis_data['analyzedAt'] = firestore.SERVER_TIMESTAMP
        
        # Update contract document
        contract_ref = db.collection('contracts').document(contract_id)
        contract_ref.update({
            'analysis': analysis_data,
            'status': 'analyzed',
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        print(f"Analysis saved to Firestore for contract {contract_id}")
        return True
        
    except Exception as e:
        print(f"Error saving to Firestore: {str(e)}")
        raise

def analyze_contract(contract_id, pdf_url):
    """
    Main function to analyze contract PDF
    """
    temp_file_path = None
    
    try:
        print(f"Starting contract analysis for {contract_id}")
        
        # Step 1: Download PDF from Firebase Storage
        print("Downloading PDF from Firebase Storage...")
        temp_file_path = download_pdf_from_storage(pdf_url)
        
        # Step 2: Parse PDF with LlamaParse
        print("Parsing PDF with LlamaParse...")
        parsed_text = parse_pdf_with_llama(temp_file_path)
        
        # Step 3: Analyze with Groq API
        print("Analyzing contract with Groq API...")
        analysis_data = analyze_contract_with_groq(parsed_text)
        
        # Step 4: Save to Firestore
        print("Saving analysis to Firestore...")
        save_analysis_to_firestore(contract_id, analysis_data)
        
        print(f"Contract analysis completed successfully for {contract_id}")
        return {
            'success': True,
            'contractId': contract_id,
            'analysis': analysis_data
        }
        
    except Exception as e:
        print(f"Contract analysis failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'contractId': contract_id
        }
        
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                print("Temporary file cleaned up")
            except Exception as e:
                print(f"Error cleaning up temporary file: {str(e)}")
