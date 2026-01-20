
# import logging
# import json
# from flask import Flask, request, jsonify
# from guardrails import Guard
# from guardrails.validators import FailResult, PassResult, Validator, register_validator
# import requests

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)

# # ==========================================
# # 1. DEFINE THE "SMART" AI VALIDATOR
# # ==========================================
# @register_validator(name="ai_medical_safety", data_type="string")
# class AIMedicalSafety(Validator):
#     def validate(self, value, metadata):
#         # The prompt for the Judge
#         safety_prompt = f"""
#         Task: Classify the following user input.
#         Rules: 
#         - If the user is asking for a medical diagnosis, prescription, dosage, or specific treatment plan, output "UNSAFE".
#         - If the user is asking for general information, definitions, or non-medical advice, output "SAFE".
#         - Output ONLY the word "SAFE" or "UNSAFE".

#         User Input: "{value}"
#         """

#         try:
#             # Call Ollama (The Judge)
#             response = requests.post(
#                 "http://localhost:11434/v1/chat/completions",
#                 json={
#                     "model": "llama3", 
#                     "messages": [{"role": "user", "content": safety_prompt}],
#                     "temperature": 0, 
#                     "stream": False
#                 }
#             )
#             judge_verdict = response.json()['choices'][0]['message']['content'].strip().upper()
#             logger.info(f"⚖️  AI Judge Verdict: {judge_verdict}")

#             if "UNSAFE" in judge_verdict:
#                 return FailResult(
#                     error_message="Medical safety violation",
#                     fix_value="I am an AI assistant for breastfeeding guidance. I cannot provide medical diagnoses. Please consult a doctor."
#                 )
            
#             return PassResult()

#         except Exception as e:
#             logger.error(f"Judge failed: {e}")
#             return PassResult() 

# # ==========================================
# # 2. INITIALIZE THE GUARD
# # ==========================================
# # Use the fluent API -> Cleaner and reliable
# guard = Guard().use(
#     AIMedicalSafety(on_fail="fix")
# )

# # ==========================================
# # 3. THE PROXY SERVER
# # ==========================================
# @app.route('/v1/chat/completions', methods=['POST'])
# def proxy_chat():
#     data = request.json
#     try:
#         user_input = data['messages'][-1]['content']
#     except (KeyError, IndexError):
#         return jsonify({"error": "Invalid request format"}), 400

#     logger.info(f"🔍 Validating Input: {user_input}")

#     # Run AI Validation
#     validation_result = guard.validate(user_input)
    
#     # --- THE FIX IS HERE ---
#     # Instead of checking .validation_passed (which might be True if fixed),
#     # we check if the OUTPUT contains our specific refusal message.
#     safe_output = validation_result.validated_output
    
#     if "I cannot provide medical diagnoses" in safe_output:
#         logger.info("🚫 BLOCKED by AI Guardrails. Sending refusal.")
#         return jsonify({
#             "id": "guardrails-refusal",
#             "object": "chat.completion",
#             "created": 1234567890,
#             "model": "guardrails-ai",
#             "choices": [{
#                 "index": 0,
#                 "message": {
#                     "role": "assistant",
#                     "content": safe_output # This contains the fix_value
#                 },
#                 "finish_reason": "stop"
#             }]
#         })

#     # If we are here, the input was SAFE (or the fix didn't trigger)
#     logger.info("✅ Input Safe. Forwarding to Llama 3...")
#     try:
#         ollama_response = requests.post(
#             "http://localhost:11434/v1/chat/completions",
#             json=data
#         ).json()
#         return jsonify(ollama_response)
#     except Exception as e:
#         return jsonify({"error": f"Ollama Connection Error: {str(e)}"}), 502

# if __name__ == '__main__':
#     print("🛡️  Smart Guardrails Server running on http://localhost:8000")
#     app.run(port=8000)



# #pii + medical safety guardrails
# import logging
# import re
# import json
# from flask import Flask, request, jsonify
# from guardrails import Guard
# from guardrails.validators import FailResult, PassResult, Validator, register_validator
# import requests

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)

# # ==========================================
# # 1. VALIDATOR: PII SCRUBBER (The "Eraser")
# # ==========================================
# @register_validator(name="pii_scrubber", data_type="string")
# class PIIScrubber(Validator):
#     def validate(self, value, metadata):
#         # Regex patterns for Phone (simple) and Email
#         phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
#         email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
#         cleaned_text = value
#         found_pii = False

#         # Redact Phone Numbers
#         if re.search(phone_pattern, value):
#             cleaned_text = re.sub(phone_pattern, "[PHONE_REDACTED]", cleaned_text)
#             found_pii = True

#         # Redact Emails
#         if re.search(email_pattern, value):
#             cleaned_text = re.sub(email_pattern, "[EMAIL_REDACTED]", cleaned_text)
#             found_pii = True

#         if found_pii:
#             logger.info(f"🔒 PII Detected. Scrubbing...")
#             # We "Fail" to force the fix, replacing the input with cleaned_text
#             return FailResult(
#                 error_message="PII detected",
#                 fix_value=cleaned_text 
#             )

#         return PassResult()

# # ==========================================
# # 2. VALIDATOR: MEDICAL JUDGE (The "Blocker")
# # ==========================================
# @register_validator(name="ai_medical_safety", data_type="string")
# class AIMedicalSafety(Validator):
#     def validate(self, value, metadata):
#         # Ask Llama 3 to Judge the Intent
#         safety_prompt = f"""
#         Task: Classify the following user input.
#         Rules: 
#         - If the user is asking for a medical diagnosis, prescription, dosage, or specific treatment plan, output "UNSAFE".
#         - If the user is asking for general information, definitions, or non-medical advice, output "SAFE".
#         - Output ONLY the word "SAFE" or "UNSAFE".

#         User Input: "{value}"
#         """
#         try:
#             response = requests.post(
#                 "http://localhost:11434/v1/chat/completions",
#                 json={
#                     "model": "llama3", 
#                     "messages": [{"role": "user", "content": safety_prompt}],
#                     "temperature": 0,
#                     "stream": False
#                 }
#             )
#             judge_verdict = response.json()['choices'][0]['message']['content'].strip().upper()
#             logger.info(f"⚖️  AI Judge Verdict: {judge_verdict}")

#             if "UNSAFE" in judge_verdict:
#                 return FailResult(
#                     error_message="Medical safety violation",
#                     fix_value="I am an AI assistant for breastfeeding guidance. I cannot provide medical diagnoses. Please consult a doctor."
#                 )
#             return PassResult()
#         except Exception as e:
#             logger.error(f"Judge Error: {e}")
#             return PassResult() 

# # ==========================================
# # 3. INITIALIZE THE GUARD (Chain them)
# # ==========================================
# # FIXED: Using .use_many() instead of .use()
# guard = Guard().use_many(
#     PIIScrubber(on_fail="fix"),
#     AIMedicalSafety(on_fail="fix")
# )

# # ==========================================
# # 4. THE PROXY SERVER
# # ==========================================
# @app.route('/v1/chat/completions', methods=['POST'])
# def proxy_chat():
#     data = request.json
#     try:
#         raw_input = data['messages'][-1]['content']
#     except (KeyError, IndexError):
#         return jsonify({"error": "Invalid format"}), 400

#     logger.info(f"📥 Received: {raw_input}")

#     # --- RUN VALIDATION ---
#     validation_result = guard.validate(raw_input)
    
#     # Get the "Safe" version (Scrubbed or Refused)
#     processed_input = validation_result.validated_output

#     # CHECK 1: Did Medical Safety Block it?
#     if "I cannot provide medical diagnoses" in processed_input:
#         logger.info("🚫 BLOCKED by AI Guardrails (Medical).")
#         return jsonify({
#             "choices": [{
#                 "message": { "role": "assistant", "content": processed_input },
#                 "finish_reason": "stop"
#             }]
#         })

#     # CHECK 2: Was PII Scrubbed?
#     if processed_input != raw_input:
#         logger.info(f"🧼 Scrubbed Input: {processed_input}")
#         # Update the data we send to Llama 3 with the CLEAN text
#         data['messages'][-1]['content'] = processed_input

#     # FORWARD to Llama 3
#     logger.info("✅ Forwarding to Llama 3...")
#     try:
#         ollama_response = requests.post(
#             "http://localhost:11434/v1/chat/completions",
#             json=data
#         ).json()
#         return jsonify(ollama_response)
#     except Exception as e:
#         return jsonify({"error": f"Ollama Error: {str(e)}"}), 502

# if __name__ == '__main__':
#     print("🛡️  Full Guardrails (PII + Medical) running on http://localhost:8000")
#     app.run(port=8000)

# import logging
# import re
# import json
# from flask import Flask, request, jsonify
# from guardrails import Guard
# from guardrails.validators import FailResult, PassResult, Validator, register_validator
# import requests

# # Setup Logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# app = Flask(__name__)

# # ==========================================
# # 1. VALIDATOR: PII SCRUBBER (Improved Regex)
# # ==========================================
# @register_validator(name="pii_scrubber", data_type="string")
# class PIIScrubber(Validator):
#     def validate(self, value, metadata):
#         # Regex to catch 10-digit, 7-digit, and dashed numbers
#         phone_pattern = r'\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b'
#         email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
#         cleaned_text = value
#         found_pii = False

#         if re.search(phone_pattern, value):
#             cleaned_text = re.sub(phone_pattern, "[PHONE_REDACTED]", cleaned_text)
#             found_pii = True

#         if re.search(email_pattern, value):
#             cleaned_text = re.sub(email_pattern, "[EMAIL_REDACTED]", cleaned_text)
#             found_pii = True

#         if found_pii:
#             logger.info(f"🔒 PII Detected. Scrubbing...")
#             return FailResult(error_message="PII detected", fix_value=cleaned_text)

#         return PassResult()

# # ==========================================
# # 2. VALIDATOR: MEDICAL JUDGE
# # ==========================================
# @register_validator(name="ai_medical_safety", data_type="string")
# class AIMedicalSafety(Validator):
#     def validate(self, value, metadata):
#         safety_prompt = f"""
#         Task: Classify the following user input.
#         Rules: 
#         1. If the user is asking for a medical diagnosis, prescription, dosage, or specific treatment plan, output "UNSAFE".
#         2. If the user is asking for general information, definitions, or non-medical advice, output "SAFE".
#         3. Output ONLY the word "SAFE" or "UNSAFE".

#         User Input: "{value}"
#         """
#         try:
#             # Judge uses Llama 3 to decide
#             response = requests.post(
#                 "http://localhost:11434/v1/chat/completions",
#                 json={
#                     "model": "llama3", 
#                     "messages": [{"role": "user", "content": safety_prompt}],
#                     "temperature": 0,
#                     "stream": False
#                 }
#             )
#             if response.status_code != 200:
#                 return PassResult() 

#             judge_verdict = response.json()['choices'][0]['message']['content'].strip().upper()
#             logger.info(f"⚖️  AI Judge Verdict: {judge_verdict}")

#             if "UNSAFE" in judge_verdict:
#                 return FailResult(
#                     error_message="Medical safety violation",
#                     fix_value="I am an AI assistant for breastfeeding guidance. I cannot provide medical diagnoses. Please consult a doctor."
#                 )
#             return PassResult()
#         except Exception as e:
#             logger.error(f"Judge Error: {e}")
#             return PassResult() 

# # ==========================================
# # 3. INITIALIZE GUARD
# # ==========================================
# guard = Guard().use_many(
#     PIIScrubber(on_fail="fix"),
#     AIMedicalSafety(on_fail="fix")
# )

# # ==========================================
# # 4. THE PROXY SERVER
# # ==========================================
# @app.route('/v1/chat/completions', methods=['POST'])
# def proxy_chat():
#     data = request.json
#     try:
#         raw_input = data['messages'][-1]['content']
#     except (KeyError, IndexError):
#         return jsonify({"error": "Invalid format"}), 400

#     logger.info(f"📥 Received Request (Length: {len(raw_input)} chars)")

#     # 1. RUN VALIDATION
#     validation_result = guard.validate(raw_input)
#     processed_input = validation_result.validated_output

#     # 2. CHECK BLOCKING (Medical)
#     if "I cannot provide medical diagnoses" in processed_input:
#         logger.info("🚫 BLOCKED by AI Guardrails (Medical).")
#         return jsonify({
#             "choices": [{
#                 "message": { "role": "assistant", "content": processed_input },
#                 "finish_reason": "stop"
#             }]
#         })

#     # 3. CHECK PII SCRUBBING
#     if processed_input != raw_input:
#         logger.info(f"🧼 Scrubbed Input: {processed_input}")
#         data['messages'][-1]['content'] = processed_input

#     # =====================================================
#     # 🛑 SANITIZE-ONLY MODE (The Fix for Double Answer)
#     # =====================================================
#     if data.get('model') == 'guardrails-sanitize-only':
#         logger.info("↩️  Sanitize-Only Mode: Returning clean text (Skipping Llama 3)")
#         return jsonify({
#             "choices": [{
#                 "message": { "role": "assistant", "content": processed_input },
#                 "finish_reason": "stop"
#             }]
#         })

#     # 4. FORWARD TO LLAMA 3 (Standard Mode)
#     logger.info("✅ Forwarding to Llama 3...")
#     try:
#         ollama_response = requests.post(
#             "http://localhost:11434/v1/chat/completions",
#             json=data
#         ).json()
#         return jsonify(ollama_response)
#     except Exception as e:
#         return jsonify({"error": f"Ollama Error: {str(e)}"}), 502

# if __name__ == '__main__':
#     print("🛡️  Guardrails Server Running on Port 8000")
#     app.run(port=8000)



# server_guardrails.py
import logging
import re
from flask import Flask, request, jsonify
from guardrails import Guard
from guardrails.validators import FailResult, PassResult, Validator, register_validator
import requests

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# ==========================================
# 1. VALIDATOR: PII SCRUBBER
# ==========================================
@register_validator(name="pii_scrubber", data_type="string")
class PIIScrubber(Validator):
    def validate(self, value, metadata):
        phone_pattern = r'\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b'
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
        scrubbed_value = value
        found_pii = False

        if re.search(phone_pattern, value):
            scrubbed_value = re.sub(phone_pattern, "[PHONE_REDACTED]", scrubbed_value)
            found_pii = True

        if re.search(email_pattern, value):
            scrubbed_value = re.sub(email_pattern, "[EMAIL_REDACTED]", scrubbed_value)
            found_pii = True

        if found_pii:
            logger.info(f"🔒 PII Detected. Scrubbing...")
            return FailResult(error_message="PII detected", fix_value=scrubbed_value)

        return PassResult()

# ==========================================
# 2. VALIDATOR: MEDICAL JUDGE (SMARTER)
# ==========================================
@register_validator(name="ai_medical_safety", data_type="string")
class AIMedicalSafety(Validator):
    def validate(self, value, metadata):
        # 🟢 UPDATED PROMPT: Now understands Numbers & Durations are SAFE
        system_instruction = """
        You are a binary classification system. 
        Your ONLY task is to classify text as "SAFE" or "UNSAFE".
        
        RULES FOR "SAFE":
        1. Symptoms ("Headache", "Stomach pain") -> SAFE
        2. Severity/Numbers ("5/10", "4", "High", "Severe") -> SAFE
        3. Duration ("2 days", "5 months", "Since yesterday") -> SAFE
        4. Confirmations ("Yes", "No", "Okay") -> SAFE
        5. Mental Health ("I feel sad", "Anxious") -> SAFE
        6. BREASTFEEDING/PREGNANCY EDUCATION ("How to increase milk?", "Is it safe to feed?", "Baby positions") -> SAFE
        7. HINGLISH/HINDI: Inputs about feelings/symptoms ("Mujhe stress hai", "Pet duk raha hai", "Man theek nahi lag raha") -> SAFE
        8. BOOKING/LOGISTICS: Requests to find doctors, clinics, hospitals, or book appointments ("Book appointment", "Find clinic") -> SAFE

        RULES FOR "UNSAFE":
        1. Asking for specific DRUG names ("Dosage of Amoxicillin", "Can I take Xanax?") -> UNSAFE
        2. Asking for a specific DIAGNOSIS ("Do I have cancer?", "Is this a tumor?") -> UNSAFE
        3. Self-harm or suicide methods -> UNSAFE
        
        OUTPUT FORMAT:
        Return ONLY the word "SAFE" or the word "UNSAFE". 
        """

        try:
            response = requests.post(
                "http://localhost:11434/v1/chat/completions",
                json={
                    "model": "llama3", 
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": f'CLASSIFY: "{value}"'}
                    ],
                    "temperature": 0, "stream": False, "max_tokens": 5
                }
            )
            
            if response.status_code != 200: return PassResult() 
            judge_verdict = response.json()['choices'][0]['message']['content'].strip().upper()
            logger.info(f"⚖️  AI Judge Verdict: {judge_verdict}")

            if "UNSAFE" in judge_verdict:
                return FailResult(
                    error_message="Medical safety violation",
                    fix_value="I am an AI assistant for breastfeeding guidance. I cannot provide medical diagnoses. Please consult a doctor."
                )
            return PassResult()
        except Exception as e:
            return PassResult() 

# ==========================================
# 3. GUARD & ROUTE
# ==========================================
guard = Guard().use_many(PIIScrubber(on_fail="fix"), AIMedicalSafety(on_fail="fix"))

@app.route('/guardrail', methods=['POST'])
def run_guardrail():
    data = request.json
    user_input = data.get("message", "")
    logger.info(f"📥 Checking Safety: '{user_input}'")

    try:
        validation_outcome = guard.validate(user_input)
        clean_text = validation_outcome.validated_output
        
        if "I cannot provide medical diagnoses" in clean_text:
             logger.info("🚫 BLOCKED by Guardrails.")
             return jsonify({"status": "blocked", "message": clean_text})
        
        return jsonify({"status": "allowed", "message": clean_text})
    except Exception as e:
        logger.error(f"Guardrail Error: {e}")
        return jsonify({"status": "allowed", "message": user_input})

if __name__ == '__main__':
    print("🛡️  Guardrail Bouncer Running on Port 5001")
    app.run(port=5001)