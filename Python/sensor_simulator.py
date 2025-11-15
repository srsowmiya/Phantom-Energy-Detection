"""
Phantom Energy Detection - Python Sensor Simulator
This script simulates Arduino sensor readings and sends them to Node.js backend
"""

import requests
import time
import random
import json

# --- CONFIGURATION ---
# Node.js Backend URL (change if your backend runs on different port/host)
NODE_SERVER_URL = "http://localhost:3000/api/sensor/reading"

# Device Configuration
# Get this token from your device management page in the frontend
# Or create a device and generate a token
DEVICE_TOKEN = "YOUR_DEVICE_TOKEN_HERE"  # Replace with your actual device token

# Port Configuration
# Get this UUID from your ports management page in the frontend
PORT_ID = "YOUR_PORT_ID_HERE"  # Replace with your actual port UUID

# Reading interval (seconds)
READING_INTERVAL = 2  # Send reading every 2 seconds


def generate_sensor_data():
    """
    Simulate Arduino sensor readings
    Returns: voltage (V), current (A), power (W)
    """
    # Simulate voltage fluctuation (typical range: 220-240V)
    voltage = round(random.uniform(228.0, 232.0), 2)
    
    # Simulate current (Amps) - fluctuating slightly
    amps = round(random.uniform(0.4, 0.6), 3)
    
    # Calculate Power (Watts)
    power = round(voltage * amps, 2)
    
    return voltage, amps, power


def send_reading_to_backend(voltage, current, power):
    """
    Send sensor reading to Node.js backend via HTTP POST
    """
    try:
        # Prepare data payload
        payload = {
            "deviceToken": DEVICE_TOKEN,
            "portId": PORT_ID,
            "voltage": voltage,
            "current": current,
            "power": power
        }
        
        # Send POST request to Node.js backend
        response = requests.post(
            NODE_SERVER_URL,
            json=payload,
            headers={
                "Content-Type": "application/json"
            },
            timeout=5  # 5 second timeout
        )
        
        # Check response
        if response.status_code == 201:
            data = response.json()
            if data.get("success"):
                print(f"✅ Success -> Voltage: {voltage}V | Current: {current}A | Power: {power}W")
                if data.get("data", {}).get("phantomDetected"):
                    print(f"   ⚠️  Phantom energy detected! Port status: {data.get('data', {}).get('portStatus')}")
                return True
            else:
                print(f"❌ Error: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Cannot connect to {NODE_SERVER_URL}")
        print("   Make sure your Node.js backend is running on port 3000")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Timeout: Server did not respond in time")
        return False
    except Exception as e:
        print(f"❌ Error sending data: {str(e)}")
        return False


def run_simulator():
    """
    Main loop: Generate data and send to backend
    """
    print("=" * 60)
    print("🚀 PHANTOM ENERGY DETECTION - SENSOR SIMULATOR")
    print("=" * 60)
    print(f"📡 Backend URL: {NODE_SERVER_URL}")
    print(f"🔑 Device Token: {DEVICE_TOKEN[:20]}...")
    print(f"🔌 Port ID: {PORT_ID[:20]}...")
    print(f"⏱️  Reading Interval: {READING_INTERVAL} seconds")
    print("=" * 60)
    print()
    
    # Validate configuration
    if DEVICE_TOKEN == "YOUR_DEVICE_TOKEN_HERE" or PORT_ID == "YOUR_PORT_ID_HERE":
        print("❌ ERROR: Please configure DEVICE_TOKEN and PORT_ID in the script")
        print()
        print("How to get these values:")
        print("1. Start your Node.js backend: npm start (in Backend folder)")
        print("2. Start your frontend: npm run dev (in frontend folder)")
        print("3. Login to the frontend")
        print("4. Go to Devices page and create a device (or use existing)")
        print("5. Click 'Token' button to generate/copy device token")
        print("6. Go to Ports page and create a port (or use existing)")
        print("7. Copy the Port ID from the URL or inspect element")
        print("8. Update DEVICE_TOKEN and PORT_ID in this script")
        return
    
    print("📊 Starting sensor readings...")
    print("   Press Ctrl+C to stop")
    print()
    
    try:
        while True:
            # 1. Generate simulated sensor data
            voltage, current, power = generate_sensor_data()
            
            # 2. Send to Node.js backend
            send_reading_to_backend(voltage, current, power)
            
            # 3. Wait before next reading
            time.sleep(READING_INTERVAL)
            
    except KeyboardInterrupt:
        print()
        print("=" * 60)
        print("🛑 Simulator stopped by user")
        print("=" * 60)


if __name__ == "__main__":
    run_simulator()

