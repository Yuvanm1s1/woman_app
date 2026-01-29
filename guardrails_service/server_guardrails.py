



# # server_guardrails.py
# import logging
# import re
# from flask import Flask, request, jsonify
# from guardrails import Guard
# from guardrails.validators import FailResult, PassResult, Validator, register_validator
# import requests

# # --- LOGGING SETUP ---
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# app = Flask(__name__)

# # ==========================================
# # 1. VALIDATOR: PII SCRUBBER
# # ==========================================
# @register_validator(name="pii_scrubber", data_type="string")
# class PIIScrubber(Validator):
#     def validate(self, value, metadata):
#         phone_pattern = r'\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b'
#         email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
#         scrubbed_value = value
#         found_pii = False

#         if re.search(phone_pattern, value):
#             scrubbed_value = re.sub(phone_pattern, "[PHONE_REDACTED]", scrubbed_value)
#             found_pii = True

#         if re.search(email_pattern, value):
#             scrubbed_value = re.sub(email_pattern, "[EMAIL_REDACTED]", scrubbed_value)
#             found_pii = True

#         if found_pii:
#             logger.info(f"🔒 PII Detected. Scrubbing...")
#             return FailResult(error_message="PII detected", fix_value=scrubbed_value)

#         return PassResult()

# # ==========================================
# # 2. VALIDATOR: MEDICAL JUDGE (SMARTER)
# # ==========================================
# @register_validator(name="ai_medical_safety", data_type="string")
# class AIMedicalSafety(Validator):
#     def validate(self, value, metadata):
#         # 🟢 UPDATED PROMPT: Now understands Numbers & Durations are SAFE
#         system_instruction = """
#         You are a binary classification system. 
#         Your ONLY task is to classify text as "SAFE" or "UNSAFE".
        
#         RULES FOR "SAFE":
#         1. Symptoms ("Headache", "Stomach pain") -> SAFE
#         2. Severity/Numbers ("5/10", "4", "High", "Severe") -> SAFE
#         3. Duration ("2 days", "5 months", "Since yesterday") -> SAFE
#         4. Confirmations ("Yes", "No", "Okay") -> SAFE
#         5. Mental Health ("I feel sad", "Anxious") -> SAFE
#         6. BREASTFEEDING/PREGNANCY EDUCATION ("How to increase milk?", "Is it safe to feed?", "Baby positions") -> SAFE
#         7. HINGLISH/HINDI: Inputs about feelings/symptoms ("Mujhe stress hai", "Pet duk raha hai", "Man theek nahi lag raha") -> SAFE
#         8. BOOKING/LOGISTICS: Requests to find doctors, clinics, hospitals, or book appointments ("Book appointment", "Find clinic") -> SAFE

#         RULES FOR "UNSAFE":
#         1. Asking for specific DRUG names ("Dosage of Amoxicillin", "Can I take Xanax?") -> UNSAFE
#         2. Asking for a specific DIAGNOSIS ("Do I have cancer?", "Is this a tumor?") -> UNSAFE
#         3. Self-harm or suicide methods -> UNSAFE
        
#         OUTPUT FORMAT:
#         Return ONLY the word "SAFE" or the word "UNSAFE". 
#         """

#         try:
#             response = requests.post(
#                 "http://localhost:11434/v1/chat/completions",
#                 json={
#                     "model": "llama3", 
#                     "messages": [
#                         {"role": "system", "content": system_instruction},
#                         {"role": "user", "content": f'CLASSIFY: "{value}"'}
#                     ],
#                     "temperature": 0, "stream": False, "max_tokens": 5
#                 }
#             )
            
#             if response.status_code != 200: return PassResult() 
#             judge_verdict = response.json()['choices'][0]['message']['content'].strip().upper()
#             logger.info(f"⚖️  AI Judge Verdict: {judge_verdict}")

#             if "UNSAFE" in judge_verdict:
#                 return FailResult(
#                     error_message="Medical safety violation",
#                     fix_value="I am an AI assistant for breastfeeding guidance. I cannot provide medical diagnoses. Please consult a doctor."
#                 )
#             return PassResult()
#         except Exception as e:
#             return PassResult() 

# # ==========================================
# # 3. GUARD & ROUTE
# # ==========================================
# guard = Guard().use_many(PIIScrubber(on_fail="fix"), AIMedicalSafety(on_fail="fix"))

# @app.route('/guardrail', methods=['POST'])
# def run_guardrail():
#     data = request.json
#     user_input = data.get("message", "")
#     logger.info(f"📥 Checking Safety: '{user_input}'")

#     try:
#         validation_outcome = guard.validate(user_input)
#         clean_text = validation_outcome.validated_output
        
#         if "I cannot provide medical diagnoses" in clean_text:
#              logger.info("🚫 BLOCKED by Guardrails.")
#              return jsonify({"status": "blocked", "message": clean_text})
        
#         return jsonify({"status": "allowed", "message": clean_text})
#     except Exception as e:
#         logger.error(f"Guardrail Error: {e}")
#         return jsonify({"status": "allowed", "message": user_input})

# if __name__ == '__main__':
#     print("🛡️  Guardrail Bouncer Running on Port 5001")
#     app.run(port=5001)


# import logging
# import re
# import os
# from flask import Flask, request, jsonify
# from guardrails import Guard
# from guardrails.validators import FailResult, PassResult, Validator, register_validator
# from openai import OpenAI
# from dotenv import load_dotenv

# # Load .env (ensure OPENAI_API_KEY is inside)
# load_dotenv() 

# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# # 1. PII SCRUBBER
# @register_validator(name="pii_scrubber", data_type="string")
# class PIIScrubber(Validator):
#     def validate(self, value, metadata):
#         # ... (Same regex logic as before) ...
#         phone_pattern = r'\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b'
#         if re.search(phone_pattern, value):
#             return FailResult(error_message="PII", fix_value="[REDACTED]")
#         return PassResult()

# # 2. MEDICAL JUDGE (GPT-4o-mini)
# @register_validator(name="ai_medical_safety", data_type="string")
# class AIMedicalSafety(Validator):
#     def validate(self, value, metadata):
#         system_instruction = """
#         Classify text as "SAFE" or "UNSAFE".
#         🚨 CRITICAL RULE: IF THE USER WANTS TO FIND A DOCTOR, CLINIC, OR BOOK AN APPOINTMENT, IT IS ALWAYS "SAFE".
        
#         RULES FOR "SAFE":
#         1. BOOKING/LOGISTICS: "Find a doctor", "Book appointment", "Search for dentist", "Where is the hospital?" (EVEN IF symptoms are mentioned).
#            - Example: "I have tooth pain, find a doctor" -> SAFE
#            - Example: "My leg hurts, book appointment" -> SAFE
#         2. Symptoms/Mental Health: "I have a headache", "I feel sad", "I am anxious".
#         3. Education: Questions about breastfeeding, nutrition, or baby care.
#         4. HINGLISH: "Mere daant mein dard hai" (I have tooth pain) -> SAFE.

#         RULES FOR "UNSAFE":
#         1. Asking for DRUGS/DOSAGE: "Can I take Azithromycin?", "How much paracetamol to die?" -> UNSAFE
#         2. Asking for DIAGNOSIS: "Do I have cancer?", "Is this lump a tumor?" -> UNSAFE
#         3. Self-harm instructions.


#         OUTPUT FORMAT:
#         Return ONLY the word "SAFE" or the word "UNSAFE".
#         """
#         try:
#             response = client.chat.completions.create(
#                 model="gpt-4o-mini",
#                 messages=[
#                     {"role": "system", "content": system_instruction},
#                     {"role": "user", "content": f'CLASSIFY: "{value}"'}
#                 ],
#                 temperature=0, max_tokens=5
#             )
#             verdict = response.choices[0].message.content.strip().upper()
#             if "UNSAFE" in verdict:
#                 return FailResult(error_message="Safety Violation", fix_value="I cannot provide diagnosis/drugs.")
#             return PassResult()
#         except Exception:
#             return PassResult()

# guard = Guard().use_many(PIIScrubber(on_fail="fix"), AIMedicalSafety(on_fail="fix"))

# @app.route('/guardrail', methods=['POST'])
# def run_guardrail():
#     data = request.json
#     try:
#         res = guard.validate(data.get("message", ""))
#         return jsonify({"status": "allowed", "message": res.validated_output})
#     except:
#         return jsonify({"status": "allowed", "message": data.get("message", "")})

# if __name__ == '__main__':
#     app.run(port=5001)



# import logging
# import re
# import os
# import whisper # <--- LOCAL WHISPER IMPORT
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from guardrails import Guard
# from guardrails.validators import FailResult, PassResult, Validator, register_validator
# from openai import OpenAI
# from dotenv import load_dotenv

# # Load .env
# load_dotenv() 

# # Setup Logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app) # <--- CRITICAL: Allows React to talk to this server

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# # ==========================================
# # ⏳ LOAD MODELS (Runs once on startup)
# # ==========================================
# print("⏳ Loading Whisper Model (Base)... This uses your CPU/GPU.")
# voice_model = whisper.load_model("base")
# print("✅ Whisper Model Loaded!")

# # Ensure temp folder exists for audio uploads
# UPLOAD_FOLDER = './temp_audio'
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

# # ==========================================
# # 🎤 1. VOICE TRANSCRIPTION ROUTE (For Frontend)
# # ==========================================
# @app.route('/transcribe', methods=['POST'])
# def transcribe_audio():
#     print("🎤 [VOICE NODE] Received Audio...")
    
#     if 'audio' not in request.files:
#         return jsonify({'error': 'No audio file provided'}), 400

#     audio_file = request.files['audio']
#     if audio_file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     # Save file temporarily
#     file_path = os.path.join(UPLOAD_FOLDER, "input.wav")
#     audio_file.save(file_path)

#     try:
#         # Run Local Whisper
#         result = voice_model.transcribe(file_path)
#         text = result['text']
#         print(f"✅ Transcribed: {text}")
#         return jsonify({'text': text})

#     except Exception as e:
#         print(f"❌ Voice Error: {e}")
#         return jsonify({'error': str(e)}), 500

# # ==========================================
# # 🛡️ 2. GUARDRAIL ROUTE (For Node Backend)
# # ==========================================
# @register_validator(name="pii_scrubber", data_type="string")
# class PIIScrubber(Validator):
#     def validate(self, value, metadata):
#         phone_pattern = r'\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b'
#         if re.search(phone_pattern, value):
#             return FailResult(error_message="PII", fix_value="[REDACTED]")
#         return PassResult()

# @register_validator(name="ai_medical_safety", data_type="string")
# class AIMedicalSafety(Validator):
#     def validate(self, value, metadata):
#         # Judge Logic
#         system_instruction = """
#         You are a safety classifier. 
        
#         🚨 CRITICAL RULE: The user is answering medical triage questions. 
#         Contexts like "Pain is 8/10", "It hurts a lot", "Since yesterday" are SAFE.

#         RULES FOR SAFE (ALLOW THESE):
#         1. "Find a doctor", "Book appointment".
#         2. Symptoms: "My head hurts", "I feel sad".
#         3. Triage Answers: "4/10", "Severity is 8", "High pain", "2 days ago". <--- ✅ NEW FIX
#         4. Hinglish: "Mere daant mein dard hai".
        
#         RULES FOR UNSAFE (BLOCK THESE):
#         1. Asking for specific PRESCRIPTIONS: "Can I take Azithromycin?".
#         2. Asking for DIAGNOSIS: "Do I have cancer?".
#         3. Self-harm / Suicide methods.
        
#         Return ONLY: "SAFE" or "UNSAFE".
#         """
#         try:
#             response = client.chat.completions.create(
#                 model="gpt-4o-mini",
#                 messages=[
#                     {"role": "system", "content": system_instruction},
#                     {"role": "user", "content": f'CLASSIFY: "{value}"'}
#                 ],
#                 temperature=0, max_tokens=5
#             )
#             verdict = response.choices[0].message.content.strip().upper()
#             print(f"⚖️ AI Judge Verdict: {verdict}") 

#             if "UNSAFE" in verdict:
#                 return FailResult(error_message="Safety Violation", fix_value="I cannot provide diagnosis/drugs.")
#             return PassResult()
#         except Exception:
#             return PassResult()

# guard = Guard().use_many(PIIScrubber(on_fail="fix"), AIMedicalSafety(on_fail="fix"))

# @app.route('/guardrail', methods=['POST'])
# def run_guardrail():
#     data = request.json
#     try:
#         res = guard.validate(data.get("message", ""))
#         return jsonify({"status": "allowed", "message": res.validated_output})
#     except:
#         return jsonify({"status": "allowed", "message": data.get("message", "")})

# if __name__ == '__main__':
#     print("🛡️  Dr. AI Brain (Voice + Guardrails) Running on Port 5001")
#     app.run(port=5001, debug=False)









import logging
import re
import os
import whisper # <--- LOCAL WHISPER IMPORT
from flask import Flask, request, jsonify
from flask_cors import CORS
from guardrails import Guard
from guardrails.validators import FailResult, PassResult, Validator, register_validator
from openai import OpenAI
from dotenv import load_dotenv

# Load .env
load_dotenv() 

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app) # <--- CRITICAL: Allows React to talk to this server

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ==========================================
# ⏳ LOAD MODELS (Runs once on startup)
# ==========================================
print("⏳ Loading Whisper Model (Base)... This uses your CPU/GPU.")
voice_model = whisper.load_model("base")
print("✅ Whisper Model Loaded!")

# Ensure temp folder exists for audio uploads
UPLOAD_FOLDER = './temp_audio'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ==========================================
# 🎤 1. VOICE TRANSCRIPTION ROUTE
# ==========================================
@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    print("🎤 [VOICE NODE] Received Audio...")
    
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save file temporarily
    file_path = os.path.join(UPLOAD_FOLDER, "input.wav")
    audio_file.save(file_path)

    try:
        # Run Local Whisper
        result = voice_model.transcribe(file_path)
        text = result['text']
        print(f"✅ Transcribed: {text}")
        return jsonify({'text': text})

    except Exception as e:
        print(f"❌ Voice Error: {e}")
        return jsonify({'error': str(e)}), 500

# ==========================================
# 🛡️ 2. GUARDRAIL ROUTE (UPDATED JUDGE)
# ==========================================
@register_validator(name="pii_scrubber", data_type="string")
class PIIScrubber(Validator):
    def validate(self, value, metadata):
        phone_pattern = r'\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b'
        if re.search(phone_pattern, value):
            return FailResult(error_message="PII", fix_value="[REDACTED]")
        return PassResult()

@register_validator(name="ai_medical_safety", data_type="string")
class AIMedicalSafety(Validator):
    def validate(self, value, metadata):
        # Judge Logic - UPDATED TO BE PERMISSIVE
        system_instruction = """
        You are a safety classifier. 
        
        🚨 MISSION: ALLOW almost everything except direct requests for prescription drugs or self-harm.

        ✅ SAFE (ALLOW THESE):
        ANY QUESTION REGARDING BREASTFEEDING AND PREGNANCY IS ALWAYS SAFE.
        1. "I have the flu, can I breastfeed?" (General medical question -> SAFE)
        2. "Baby weight is low" (Symptom description -> SAFE)
        3. "My leg hurts", "Stomach pain" (Triage -> SAFE)
        4. "Dolo 650", "Paracetamol" (Over-the-counter mention -> SAFE)
        5. "4/10", "Severity 8" (Numbers -> SAFE)
        6. ANY Hinglish: "Mujhe flu hai", "Dard ho raha hai" -> SAFE.

        ❌ UNSAFE (BLOCK THESE ONLY):
        1. "Can I take Azithromycin?" (Request for SPECIFIC PRESCRIPTION dosage).
        2. "How to cut my wrist?" (Self-harm).
        3. "Do I have cancer?" (Request for distinct diagnosis).
        
        If unsure, classify as "SAFE".
        Return ONLY: "SAFE" or "UNSAFE".
        """
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f'CLASSIFY: "{value}"'}
                ],
                temperature=0, max_tokens=5
            )
            verdict = response.choices[0].message.content.strip().upper()
            print(f"⚖️ AI Judge Verdict: {verdict}") 

            if "UNSAFE" in verdict:
                return FailResult(error_message="Safety Violation", fix_value="I cannot provide diagnosis/drugs.")
            return PassResult()
        except Exception:
            return PassResult()

guard = Guard().use_many(PIIScrubber(on_fail="fix"), AIMedicalSafety(on_fail="fix"))

@app.route('/guardrail', methods=['POST'])
def run_guardrail():
    data = request.json
    try:
        res = guard.validate(data.get("message", ""))
        return jsonify({"status": "allowed", "message": res.validated_output})
    except:
        return jsonify({"status": "allowed", "message": data.get("message", "")})

if __name__ == '__main__':
    print("🛡️  Dr. AI Brain (Voice + Guardrails) Running on Port 5001")
    app.run(port=5001, debug=False)