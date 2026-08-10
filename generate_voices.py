import os
import sys
import json
import subprocess
import requests

# Load ELEVENLABS_API_KEY from environment or .env
def load_api_key():
    # Check environment variable first
    env_key = os.environ.get("ELEVENLABS_API_KEY")
    if env_key:
        return env_key
        
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return None
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            stripped = line.strip()
            if stripped.startswith("ELEVENLABS_API_KEY="):
                return stripped.split("=", 1)[1].strip()
            elif stripped and "=" not in stripped and len(stripped) > 20:
                return stripped
    return None

# Voice IDs
ANNOUNCER_VOICE_ID = "kNZp1eirjeJWoOANksVq"  # Adam (booming announcer)
NARRATOR_VOICE_ID = "kNZp1eirjeJWoOANksVq"   # Rachel (clear narrator)

import re

def generate_speech(text, voice_id, api_key, output_path):
    print(f"Generating voice for: '{text[:40]}...' -> {os.path.basename(output_path)}")
    
    # Pronunciation fixes for TTS (forces 'Live' as /laɪv/ like a live plant, and 'INC.'/'Inc.' as 'Incorporated')
    spoken_text = re.sub(r'\bLive\b', 'Lyve', text, flags=re.IGNORECASE)
    spoken_text = re.sub(r'\bINC\.?\b', 'Incorporated', spoken_text, flags=re.IGNORECASE)

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "text": spoken_text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(response.content)
            return True
        else:
            print(f"Error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"Request failed: {e}")
        return False

def main():
    api_key = load_api_key()
    if not api_key:
        print("Error: ELEVENLABS_API_KEY not found in .env file.")
        print("Please set your API key by running the PowerShell command provided in the instructions.")
        sys.exit(1)
        
    print("API Key loaded successfully.")
    
    # 1. Parse questions from JS by writing a temp exporter script
    temp_js_path = "./get_questions_temp.js"
    temp_json_path = "./questions_temp.json"
    
    js_exporter_code = """
import { jeopardyRound, doubleJeopardyRound, finalJeopardy } from './src/data/questions.js';
import fs from 'fs';
fs.writeFileSync('./questions_temp.json', JSON.stringify({ jeopardyRound, doubleJeopardyRound, finalJeopardy }));
"""
    
    with open(temp_js_path, "w", encoding="utf-8") as f:
        f.write(js_exporter_code)
        
    try:
        print("Exporting questions data from JS to JSON...")
        subprocess.run(["node", temp_js_path], check=True)
    except Exception as e:
        print(f"Failed to export questions: {e}")
        # Clean up temp script if it exists
        if os.path.exists(temp_js_path):
            os.remove(temp_js_path)
        sys.exit(1)
        
    # Read the exported JSON
    with open(temp_json_path, "r", encoding="utf-8") as f:
        questions_data = json.load(f)
        
    # Clean up temp files
    os.remove(temp_js_path)
    os.remove(temp_json_path)
    print("Questions data exported successfully.")
    
    # Create directories if they don't exist
    sounds_dir = "./public/sounds"
    clues_dir = os.path.join(sounds_dir, "clues")
    os.makedirs(clues_dir, exist_ok=True)
    
    # 2. Generate Announcer Intro Files
    new_intro_script = "Lyve from the studio, and streaming to champions everywhere... Get ready for the ultimate test of wit, wisdom, and community pride! It’s time to play... JEOPARDY! Featuring the phenomenal women of THE CHARMETTES, INCORPORATED! Let's meet our contestants!"
    
    intro_phrases = [
        ("Lyve from the Studio...", "announcer_1.mp3"),
        ("It's the National Women's Community Service Game Show...", "announcer_2.mp3"),
        ("THE CHARMETTES, INCORPORATED JEOPARDY!", "announcer_3.mp3"),
        (new_intro_script, "announcer_full.mp3")
    ]
    
    print("\n--- Generating Announcer Voices ---")
    for text, filename in intro_phrases:
        out_path = os.path.join(sounds_dir, filename)
        # Skip if already exists to save quota, unless run with force
        if os.path.exists(out_path):
            print(f"Skipping announcer file (already exists): {filename}")
        else:
            success = generate_speech(text, ANNOUNCER_VOICE_ID, api_key, out_path)
            if not success:
                print("Failed to generate announcer voice. Exiting.")
                sys.exit(1)
                
    # 3. Generate Narrator Clue Files
    print("\n--- Generating Narrator Clue Voices ---")
    
    clue_list = []
    
    # Round 1
    for cat in questions_data.get("jeopardyRound", []):
        for q in cat.get("questions", []):
            clue_list.append((q["id"], q["clue"]))
            
    # Round 2
    for cat in questions_data.get("doubleJeopardyRound", []):
        for q in cat.get("questions", []):
            clue_list.append((q["id"], q["clue"]))
            
    # Final Jeopardy
    for q in questions_data.get("finalJeopardy", []):
        clue_list.append((q["id"], q["clue"]))
        
    print(f"Found {len(clue_list)} clues to process.")
    
    success_count = 0
    skipped_count = 0
    for cid, clue in clue_list:
        out_path = os.path.join(clues_dir, f"{cid}.mp3")
        if os.path.exists(out_path):
            skipped_count += 1
            continue
            
        success = generate_speech(clue, NARRATOR_VOICE_ID, api_key, out_path)
        if success:
            success_count += 1
        else:
            print(f"Warning: Failed to generate audio for clue ID {cid}")
            
    print(f"\nProcessing complete! Generated {success_count} new files, skipped {skipped_count} existing files.")

if __name__ == "__main__":
    main()
