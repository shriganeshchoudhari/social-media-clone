import requests
import json
import sys
import time

BASE_URL = "http://localhost:8081/api"
USERNAME = f"verify_users_{int(time.time())}"
EMAIL = f"verify_{int(time.time())}@example.com"
PASSWORD = "password"

def log(msg):
    print(f"[VERIFY] {msg}")

def fail(msg):
    print(f"[FAIL] {msg}")
    sys.exit(1)

def run():
    # 1. Register/Login
    headers = {"Content-Type": "application/json"}
    log(f"Registering user {USERNAME}...")
    try:
        res = requests.post(f"{BASE_URL}/auth/register", json={
            "username": USERNAME,
            "email": EMAIL,
            "password": PASSWORD
        }, timeout=5)
    except requests.exceptions.RequestException as e:
        fail(f"Registration request failed: {e}")
    
    if res.status_code == 200:
        token = res.json()["token"]
        log("Registered successfully.")
    elif res.status_code == 400 and "taken" in res.text:
        log("User exists, logging in...")
        res = requests.post(f"{BASE_URL}/auth/login", json={
            "username": USERNAME,
            "password": PASSWORD
        }, timeout=5)
        if res.status_code != 200: fail(f"Login failed: {res.text}")
        token = res.json()["token"]
        log("Logged in successfully.")
    else:
        fail(f"Registration failed: {res.status_code} {res.text}")

    headers["Authorization"] = f"Bearer {token}"

    # 2. Create Social Group
    log("Creating Social Group...")
    group_name = f"Test Community {int(time.time())}"
    group_data = {
        "name": group_name,
        "description": "A test community",
        "rules": "Be nice",
        "privacy": "PUBLIC"
    }
    # Note: /api/groups is the endpoint for Social Groups (GroupController)
    try:
        res = requests.post(f"{BASE_URL}/groups", json=group_data, headers=headers, timeout=5)
    except requests.exceptions.RequestException as e:
        fail(f"Create group request failed: {e}")

    if res.status_code != 200: fail(f"Group creation failed: {res.status_code} {res.text}")
    
    group_id = res.json()["id"]
    log(f"Group created with ID: {group_id}")

    # 3. Create Event
    log("Creating Group Event...")
    event_data = {
        "title": "Community Meetup",
        "description": "Let's meet!",
        "startTime": "2026-12-31T10:00",
        "endTime": "2026-12-31T12:00",
        "location": "Virtual"
    }
    # Endpoint: /api/groups/{id}/events
    try:
        res = requests.post(f"{BASE_URL}/groups/{group_id}/events", json=event_data, headers=headers, timeout=5)
    except requests.exceptions.RequestException as e:
        fail(f"Create event request failed: {e}")

    if res.status_code != 200: fail(f"Event creation failed: {res.status_code} {res.text}")
    
    event_id = res.json()["id"]
    log(f"Event created with ID: {event_id}")

    # 4. Get Events
    log("Fetching Group Events...")
    res = requests.get(f"{BASE_URL}/groups/{group_id}/events", headers=headers, timeout=5)
    if res.status_code != 200: fail(f"Get events failed: {res.status_code} {res.text}")
    
    events = res.json()
    if len(events) == 0: fail("No events found!")
    # Check if any event matches our ID (in case multiple)
    found_event = False
    for e in events:
        if e["id"] == event_id:
            found_event = True
            break
    
    if not found_event: fail("Event ID mismatch")
    log("Events fetched successfully.")

    # 5. Verify My Groups
    log("Verifying My Groups...")
    res = requests.get(f"{BASE_URL}/groups/my", headers=headers, timeout=5)
    if res.status_code != 200: fail(f"Get my groups failed: {res.status_code} {res.text}")
    
    my_groups = res.json()
    found = False
    for g in my_groups:
        if g["id"] == group_id:
            found = True
            break
    
    if not found: 
        log(f"My groups response: {json.dumps(my_groups, indent=2)}")
        fail("Created group not found in 'My Groups'")
    log("My Groups verified.")

    log("SUCCESS: All checks passed.")

if __name__ == "__main__":
    run()
