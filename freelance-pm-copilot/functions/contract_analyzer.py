import os
import json
import tempfile
from groq import Groq
from llama_cloud_services import LlamaParse
from firebase_admin import firestore, storage
from dotenv import load_dotenv
from google.cloud import secretmanager

# Load environment variables
load_dotenv()

def get_secret(secret_id):
    """Get secret from Google Cloud Secret Manager"""
    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/lambda-926aa/secrets/{secret_id}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        print(f"Error getting secret {secret_id}: {str(e)}")
        # Fallback to environment variable
        return os.environ.get(secret_id)

# Initialize clients with hardcoded keys (matching AI team's approach)
groq_client = Groq(api_key="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")
llama_api_key = "llx-SHymI9q0Tr65lYHubePG7sH2BwFo3myVLst8NuJThdP7x1LS"

# Initialize Firebase clients
db = firestore.client()
bucket = storage.bucket()

# Verify bucket configuration
print(f"Firebase Storage bucket name: {bucket.name}")
print(f"Firebase Storage bucket path: {bucket.path}")

# B2B Enhanced Contract Analysis with Ambiguity Detection
AMBIGUITY_SYSTEM_PROMPT = """
Sen, yazılım projesi sözleşmelerini analiz eden uzman bir AI asistanısın.
Görevin, sözleşme metnindeki belirsizlikleri (ambiguities), riskleri ve netleştirilmesi gereken maddeleri tespit etmektir.

Çıktı formatı:
{
  "summary": "Projenin 1-2 cümlelik özeti",
  "ambiguities": [
    {
      "id": "amb_1",
      "clause": "Belirsiz maddenin tam metni",
      "issue": "Neyin belirsiz olduğu",
      "severity": "low" | "medium" | "high" | "critical",
      "suggestedRedline": "Önerilen düzeltilmiş metin",
      "clarificationQuestions": ["Soru 1", "Soru 2"]
    }
  ],
  "risks": [
    {
      "id": "risk_1",
      "title": "Risk başlığı",
      "description": "Risk açıklaması",
      "severity": "low" | "medium" | "high" | "critical",
      "probability": 0-100,
      "impact": 0-100,
      "mitigation": "Önerilen risk azaltma stratejisi"
    }
  ],
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
  "timeline": {
    "optimistic": "YYYY-MM-DD (Metindeki bilgilere dayanarak tahmini en erken bitiş tarihi, bulunamazsa null)",
    "realistic": "YYYY-MM-DD (Metindeki bilgilere dayanarak tahmini gerçekçi bitiş tarihi, bulunamazsa null)",
    "pessimistic": "YYYY-MM-DD (Metindeki bilgilere dayanarak tahmini en geç bitiş tarihi, bulunamazsa null)"
  }
}
"""

# Legacy system prompt for backward compatibility
SYSTEM_PROMPT = """
Sen, bir ürün yöneticisi tarafından yazılan kodlama projesi görevlerini (task) analiz eden kıdemli bir teknik analiz uzmanısın.
Görevin, sana verilen görev metnini analiz etmek ve SADECE ve SADECE 
istenen bilgileri içeren geçerli bir JSON nesnesi döndürmektir. 
Başka hiçbir açıklama, selamlama veya yorum yapma.

Çıkarım yapman, metindeki belirsizlikleri fark etmen ve teknik gereksinimleri tahmin etmen gerekiyor.

İstenen JSON yapısı şu şekilde olmalıdır:
{
  "detailedDescription": "Metinden çıkarılan, projenin tam kapsamını ve temel hedeflerini detaylıca anlatan bir paragraf.",
  "criticalAnalysis": {
    "missingInfo": [
      "Projenin netleşmesi veya başlaması için metinde bulunmayan, kritik öneme sahip eksik bilgiler (örn: 'Başarı metrikleri tanımlanmamış', 'Hedef kullanıcı kitlesi belirsiz'). Eğer eksik bilgi yoksa boş bir dizi [] döndür."
    ],
    "risks": [
      "Metindeki ifadelere dayanarak öngörülen teknik veya operasyonel riskler (örn: 'Zaman çizelgesi, istenen özellikler için çok sıkışık', 'Belirtilen teknoloji ile entegrasyon zorluğu riski'). Eğer belirgin bir risk yoksa boş bir dizi [] döndür."
    ],
    "contradictions": [
      "Metin içinde birbiriyle çelişen ifadeler veya hedefler (örn: 'Hem 'minimum maliyet' hem de 'en yüksek performanslı altyapı' isteniyor'). Eğer çelişki yoksa boş bir dizi [] döndür."
    ]
  },
  "department": "Bu görevin birincil sorumlusu olması gereken departman veya ekip (örn: 'Backend', 'Frontend', 'Data Science', 'DevOps', 'Mobile'). Metinden bu çıkarımı yap.",
  "techStack": [
    "Metinde açıkça belirtilen veya görevin doğası gereği zorunlu olduğu çıkarımı yapılan teknolojiler, diller veya frameworkler (örn: 'Python', 'React', 'Node.js', 'PostgreSQL', 'AWS Lambda')."
  ],
  "timeline": {
    "startDate": "YYYY-MM-DD formatında projenin tahmini başlangıç tarihi (eğer metinde spesifik bir tarih varsa, yoksa null)",
    "endDate": "YYYY-MM-DD formatında projenin teslim tarihi (eğer metinde spesifik bir tarih varsa, yoksa null)"
  },
  "acceptanceCriteria": [
    "Görevin 'tamamlandı' sayılması için karşılanması gereken spesifik, ölçülebilir ve test edilebilir şartlar (örn: 'Tüm API endpointleri %99.9 uptime sağlamalı', 'Sayfa yüklenme hızı 3 saniyenin altında olmalı', 'Kullanıcı girişi 100ms içinde gerçekleşmeli')."
  ]
}
"""

def download_pdf_from_storage(pdf_url=None, pdf_path=None):
    """
    Download PDF from Firebase Storage to temporary file using Firebase Admin SDK
    """
    print("=== download_pdf_from_storage START ===")
    print(f"PDF URL: {pdf_url}")
    print(f"PDF Path: {pdf_path}")
    print(f"Bucket name: {bucket.name}")
    
    try:
        object_path = None

        if pdf_path:
            print("Using pdf_path...")
            # Accept full gs:// URIs or relative storage paths
            if pdf_path.startswith("gs://"):
                object_path = pdf_path.split("/", 3)[-1]
                print(f"Extracted from gs:// URI: {object_path}")
            else:
                object_path = pdf_path.lstrip("/")
                print(f"Using relative path: {object_path}")
        elif pdf_url:
            print("Using pdf_url...")
            # Extract path from Firebase Storage URL
            if "firebasestorage.googleapis.com" in pdf_url:
                print("Parsing firebasestorage.googleapis.com URL...")
                # Parse Firebase Storage URL: https://firebasestorage.googleapis.com/v0/b/bucket/o/path?alt=media
                from urllib.parse import urlparse, unquote
                parsed_url = urlparse(pdf_url)
                path_parts = parsed_url.path.split('/')
                print(f"URL path parts: {path_parts}")
                if len(path_parts) >= 6 and path_parts[1] == "v0" and path_parts[2] == "b" and path_parts[4] == "o":
                    # Join all parts after /o/ to get full path
                    encoded_path = '/'.join(path_parts[5:])
                    # Remove query parameters
                    encoded_path = encoded_path.split('?')[0] if '?' in encoded_path else encoded_path
                    object_path = unquote(encoded_path)
                    print(f"Extracted object path: {object_path}")
                else:
                    print("Using extract_storage_path_from_url...")
                    object_path = extract_storage_path_from_url(pdf_url)
            else:
                print("Using extract_storage_path_from_url...")
                try:
                    object_path = extract_storage_path_from_url(pdf_url)
                except ValueError as e:
                    print(f"Error extracting storage path: {str(e)}")
                    # If it's not a Firebase Storage URL, try direct download
                    if "firebasestorage.googleapis.com" not in pdf_url and "storage.googleapis.com" not in pdf_url:
                        print("Attempting direct download from non-Firebase URL...")
                        import requests
                        response = requests.get(pdf_url)
                        if response.status_code == 200:
                            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                            temp_file.write(response.content)
                            temp_file.close()
                            print(f"Downloaded via direct URL to: {temp_file.name}")
                            return temp_file.name
                        else:
                            raise ValueError(f"Direct download failed with status: {response.status_code}")
                    else:
                        raise e

        print(f"Final object_path: {object_path}")
        
        if not object_path:
            raise ValueError("Could not determine storage object path for PDF")
        
        # Use Firebase Admin SDK to download the file
        print(f"Creating blob for path: {object_path}")
        blob = bucket.blob(object_path)
        
        # Check if file exists
        print("Checking if file exists...")
        if not blob.exists():
            print(f"Blob doesn't exist, trying alternative download method...")
            # Fallback: Use the download URL directly
            if pdf_url:
                import requests
                print(f"Attempting direct download from URL: {pdf_url}")
                response = requests.get(pdf_url)
                if response.status_code == 200:
                    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                    temp_file.write(response.content)
                    temp_file.close()
                    print(f"Downloaded via direct URL to: {temp_file.name}")
                    return temp_file.name
                else:
                    print(f"Direct download failed with status: {response.status_code}")
                    # Try to list files in the bucket to debug
                    print("Listing files in bucket for debugging...")
                    blobs = bucket.list_blobs(prefix="contracts/")
                    for blob_item in blobs:
                        print(f"Found blob: {blob_item.name}")
                    raise ValueError(f"File does not exist in storage: {object_path}")
            else:
                print(f"ERROR: File does not exist in storage: {object_path}")
                print(f"Bucket: {bucket.name}")
                print(f"Full blob path: {blob.name}")
                # Try to list files in the bucket to debug
                print("Listing files in bucket for debugging...")
                blobs = bucket.list_blobs(prefix="contracts/")
                for blob_item in blobs:
                    print(f"Found blob: {blob_item.name}")
                raise ValueError(f"File does not exist in storage: {object_path}")
        
        print("File exists, downloading...")
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        blob.download_to_filename(temp_file.name)
        print(f"Downloaded to: {temp_file.name}")
        
        return temp_file.name
        
    except Exception as e:
        print(f"=== ERROR in download_pdf_from_storage ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Error details: {repr(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== END ERROR ===")
        raise

def extract_storage_path_from_url(pdf_url: str) -> str:
    """
    Extract the storage object path from a Firebase Storage download URL.
    Supports both firebasestorage.googleapis.com and storage.googleapis.com formats.
    """
    from urllib.parse import urlparse, unquote, parse_qs

    parsed_url = urlparse(pdf_url)
    host = parsed_url.netloc
    path = parsed_url.path
    bucket_name = bucket.name

    print(f"Parsing URL: {pdf_url}")
    print(f"Host: {host}")
    print(f"Path: {path}")
    print(f"Bucket name: {bucket_name}")

    # Format: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded_path>
    if 'firebasestorage.googleapis.com' in host:
        if '/o/' in path:
            encoded_path = path.split('/o/', 1)[1]
            # Remove query parameters if present
            encoded_path = encoded_path.split('?')[0] if '?' in encoded_path else encoded_path
            decoded_path = unquote(encoded_path)
            print(f"Extracted from firebasestorage URL: {decoded_path}")
            return decoded_path
        # Some URLs may include the object path in query params
        query_params = parse_qs(parsed_url.query)
        if 'name' in query_params:
            decoded_path = unquote(query_params['name'][0])
            print(f"Extracted from query params: {decoded_path}")
            return decoded_path

    # Format: https://storage.googleapis.com/<bucket>/<object_path>
    if host == 'storage.googleapis.com':
        parts = path.lstrip('/').split('/', 1)
        if len(parts) == 2 and parts[0] == bucket_name:
            decoded_path = unquote(parts[1])
            print(f"Extracted from storage.googleapis.com: {decoded_path}")
            return decoded_path

    # Format: https://<bucket>.storage.googleapis.com/<object_path>
    if host.endswith('.storage.googleapis.com'):
        potential_bucket = host.replace('.storage.googleapis.com', '')
        if potential_bucket == bucket_name:
            decoded_path = unquote(path.lstrip('/'))
            print(f"Extracted from bucket.storage.googleapis.com: {decoded_path}")
            return decoded_path

    # If it's not a Firebase Storage URL, try to handle it as a direct file path
    # This is useful for testing or when using direct file paths
    if not any(domain in host for domain in ['firebasestorage.googleapis.com', 'storage.googleapis.com']):
        print(f"Non-Firebase URL detected: {pdf_url}")
        # For non-Firebase URLs, we'll need to handle them differently
        # For now, raise an error but with more helpful message
        raise ValueError(f"URL is not a Firebase Storage URL. Expected Firebase Storage URL format, got: {pdf_url}")

    raise ValueError("Invalid Firebase Storage URL format")

def parse_pdf_with_llama(pdf_path):
    """
    Parse PDF using LlamaParse
    """
    try:
        parser = LlamaParse(
            api_key=llama_api_key,
            num_workers=4,
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
    Analyze contract text using Groq API (Legacy)
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

def analyze_contract_with_ambiguity_detection(parsed_text):
    """
    Enhanced contract analysis with ambiguity detection using Groq API
    """
    try:
        messages_to_groq = [
            {
                "role": "system",
                "content": AMBIGUITY_SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": f"""Aşağıda bir sözleşme metni bulunmaktadır. 
Lütfen bu metni sistem talimatlarında belirtilen JSON formatında analiz et:

--- SÖZLEŞME METNİ ---
{parsed_text}
--- METİN SONU ---
"""
            }
        ]

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Daha güçlü model
            messages=messages_to_groq,
            temperature=0.1,
            max_tokens=8192,
            response_format={"type": "json_object"}
        )

        json_string_response = completion.choices[0].message.content
        analysis_data = json.loads(json_string_response)
        
        return analysis_data
        
    except Exception as e:
        print(f"Groq API error (ambiguity detection): {str(e)}")
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

def analyze_contract(contract_id, pdf_url, pdf_path=None):
    """
    Main function to analyze contract PDF
    """
    temp_file_path = None
    
    try:
        print(f"Starting contract analysis for {contract_id}")
        
        # Step 1: Download PDF from Firebase Storage
        print("Downloading PDF from Firebase Storage...")
        temp_file_path = download_pdf_from_storage(pdf_url=pdf_url, pdf_path=pdf_path)
        
        # Step 2: Parse PDF with LlamaParse
        print("Parsing PDF with LlamaParse...")
        parsed_text = parse_pdf_with_llama(temp_file_path)
        
        # Step 3: Analyze with Groq API (Enhanced with ambiguity detection)
        print("Analyzing contract with Groq API (ambiguity detection)...")
        analysis_data = analyze_contract_with_ambiguity_detection(parsed_text)
        
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
