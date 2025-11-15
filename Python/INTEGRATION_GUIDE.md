# Python to Node.js Integration - Complete Step-by-Step Guide

## Overview

This guide explains how to integrate a Python script with your Node.js/Express backend for the Phantom Energy Detection system. The Python script simulates Arduino sensor readings and sends them to the Node.js backend via HTTP requests.

## Architecture

```
Python Script → HTTP POST → Node.js Backend → Sequelize ORM → MySQL Database
                                    ↓
                         (Phantom Detection Logic)
                                    ↓
                         (Notifications & Events)
```

**Key Points:**
- Python script does NOT connect to MySQL directly
- All data goes through Node.js backend
- Node.js handles all business logic (phantom detection, notifications)
- Uses existing `db.js` connection through Sequelize
- Maintains data consistency and relationships

## Step-by-Step Setup

### Step 1: Install Python Dependencies

1. Navigate to the Python folder:
   ```bash
   cd Python
   ```

2. Install required library:
   ```bash
   pip install -r requirements.txt
   ```

   This installs:
   - `requests` - For HTTP communication with Node.js

### Step 2: Start Node.js Backend

1. Navigate to Backend folder:
   ```bash
   cd Backend
   ```

2. Start the backend server:
   ```bash
   npm start
   ```

   The backend should be running on `http://localhost:3000`

   You should see:
   ```
   ✅ Database connection established successfully.
   ✅ Database synced successfully.
   Server is running on port 3000
   ```

### Step 3: Get Device Token and Port ID

1. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Login to Frontend:**
   - Open browser: `http://localhost:5173`
   - Login with your credentials

3. **Create/Get Device:**
   - Go to **Devices** page
   - Create a new device or use existing one
   - Click the **"Token"** button
   - Copy the device token (you'll see it in an alert or can copy from console)

4. **Create/Get Port:**
   - Go to **Ports** page
   - Create a new port or use existing one
   - Note the Port ID (you can find it by:
     - Inspecting the element in browser DevTools
     - Checking the database
     - Or creating a port and checking the response in Network tab)

### Step 4: Configure Python Script

1. Open `sensor_simulator.py` in a text editor

2. Update the configuration:
   ```python
   # Device Configuration
   DEVICE_TOKEN = "your-device-token-here"  # Paste device token from Step 3
   PORT_ID = "your-port-uuid-here"          # Paste port UUID from Step 3
   ```

3. (Optional) Adjust reading interval:
   ```python
   READING_INTERVAL = 2  # Send reading every 2 seconds
   ```

4. (Optional) Change backend URL if different:
   ```python
   NODE_SERVER_URL = "http://localhost:3000/api/sensor/reading"
   ```

### Step 5: Run Python Script

1. Navigate to Python folder:
   ```bash
   cd Python
   ```

2. Run the script:
   ```bash
   python sensor_simulator.py
   ```

3. You should see output like:
   ```
   ============================================================
   🚀 PHANTOM ENERGY DETECTION - SENSOR SIMULATOR
   ============================================================
   📡 Backend URL: http://localhost:3000/api/sensor/reading
   🔑 Device Token: abc123...
   🔌 Port ID: xyz789...
   ⏱️  Reading Interval: 2 seconds
   ============================================================

   📊 Starting sensor readings...
      Press Ctrl+C to stop

   ✅ Success -> Voltage: 230.5V | Current: 0.45A | Power: 103.73W
   ✅ Success -> Voltage: 229.8V | Current: 0.52A | Power: 119.50W
   ```

## How It Works

### 1. Python Script (`sensor_simulator.py`)

**What it does:**
- Generates simulated sensor data (voltage, current, power)
- Sends HTTP POST request to Node.js backend
- Handles errors and retries
- Provides real-time feedback

**Key Functions:**
- `generate_sensor_data()` - Simulates Arduino readings
- `send_reading_to_backend()` - Sends data to Node.js
- `run_simulator()` - Main loop

### 2. Node.js Backend (`/api/sensor/reading`)

**What it does:**
- Receives sensor data from Python
- Authenticates using device token
- Validates port ownership
- Saves reading to database using Sequelize
- Runs phantom detection logic
- Creates notifications if phantom energy detected
- Updates port status automatically

**Key Features:**
- Device authentication via token
- Port validation
- Phantom energy detection
- Automatic notifications
- Database operations through Sequelize (uses `db.js`)

### 3. Database (`db.js`)

**What it does:**
- Maintains MySQL connection through Sequelize
- All database operations go through Sequelize ORM
- Python script does NOT connect to database directly
- Ensures data consistency and relationships

## API Endpoint Details

### Endpoint: `POST /api/sensor/reading`

**URL:** `http://localhost:3000/api/sensor/reading`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceToken": "device-token-uuid",
  "portId": "port-uuid",
  "voltage": 230.5,
  "current": 0.45,
  "power": 103.73
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Sensor reading created successfully",
  "data": {
    "reading": {
      "id": 123,
      "voltage": 230.5,
      "current": 0.45,
      "power": 103.73,
      "timestamp": "2024-01-01T12:00:00.000Z"
    },
    "phantomDetected": false,
    "portStatus": "active"
  }
}
```

**Response (Error - 400/401/404):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Troubleshooting

### 1. Connection Error

**Error:**
```
❌ Connection Error: Cannot connect to http://localhost:3000/api/sensor/reading
   Make sure your Node.js backend is running on port 3000
```

**Solution:**
- Make sure Node.js backend is running
- Check if backend is on port 3000 (not 3001 or other)
- Verify firewall is not blocking the connection
- Check if backend URL in Python script is correct

### 2. Authentication Error

**Error:**
```
❌ Error: Invalid device token. Access denied.
```

**Solution:**
- Verify device token is correct
- Make sure device exists in database
- Generate a new device token from frontend
- Check if device token hasn't expired

### 3. Port Not Found

**Error:**
```
❌ Error: Port not found
```

**Solution:**
- Verify port ID is correct
- Make sure port exists in database
- Check if port belongs to the device's user
- Create a new port from frontend if needed

### 4. Database Connection Error

**Error:**
```
❌ Error: Database connection error
```

**Solution:**
- The Python script does NOT connect to database directly
- All database operations happen through Node.js backend
- Make sure `db.js` is configured correctly in backend
- Verify MySQL is running and accessible
- Check database credentials in `Backend/src/config/db.js`

## Advantages of This Approach

### 1. Centralized Logic
- All business logic (phantom detection, notifications) in Node.js
- Easy to maintain and update
- Single source of truth

### 2. Security
- Device authentication through tokens
- Port ownership validation
- No direct database access from Python

### 3. Consistency
- All data goes through Sequelize ORM
- Maintains relationships and constraints
- Ensures data integrity

### 4. Scalability
- Easy to add more Python scripts
- Easy to add more devices
- Can handle multiple sensors

### 5. Maintainability
- Single database connection (`db.js`)
- Consistent error handling
- Easy to debug and test

## Real Arduino Integration

To use with real Arduino instead of simulation:

1. Install `pyserial`:
   ```bash
   pip install pyserial
   ```

2. Modify `sensor_simulator.py`:
   ```python
   import serial
   
   # Connect to Arduino
   arduino = serial.Serial('COM3', 9600)  # Change port as needed
   
   while True:
       if arduino.in_waiting > 0:
           # Read data from Arduino
           line = arduino.readline().decode('utf-8').strip()
           data = json.loads(line)
           
           # Send to Node.js backend
           send_reading_to_backend(
               data["voltage"],
               data["current"],
               data["power"]
           )
   ```

## Next Steps

1. **Replace simulated data with real Arduino readings**
2. **Add error handling and retry logic**
3. **Implement data buffering for offline scenarios**
4. **Add logging and monitoring**
5. **Implement rate limiting**
6. **Add data validation**

## Summary

This integration allows Python scripts to send sensor data to your Node.js backend, which then:
- Authenticates the device
- Validates the port
- Saves data to database using Sequelize
- Runs phantom detection logic
- Creates notifications
- Updates port status

All database operations go through the existing `db.js` connection, maintaining consistency and security.

