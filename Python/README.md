# Python Sensor Simulator - Integration Guide

This Python script simulates Arduino sensor readings and sends them to your Node.js backend via HTTP requests.

## Architecture Flow

```
Python Script → HTTP POST → Node.js Backend → Sequelize ORM → MySQL Database
                                    ↓
                         (Phantom Detection Logic)
                                    ↓
                         (Notifications & Events)
```

## Step-by-Step Setup

### Step 1: Install Python Dependencies

```bash
# Navigate to Python folder
cd Python

# Install required library
pip install -r requirements.txt
```

### Step 2: Configure the Script

1. **Start your Node.js backend:**
   ```bash
   cd Backend
   npm start
   ```
   Backend should be running on `http://localhost:3000`

2. **Start your frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login to the frontend and get your credentials:**
   - Go to **Devices** page
   - Create a device or use an existing one
   - Click the **"Token"** button to generate/copy the device token
   - Go to **Ports** page
   - Create a port or use an existing one
   - Note the Port ID (you can find it in the browser's developer tools or database)

4. **Update `sensor_simulator.py`:**
   ```python
   DEVICE_TOKEN = "your-device-token-here"  # Paste device token
   PORT_ID = "your-port-uuid-here"          # Paste port UUID
   ```

### Step 3: Run the Script

```bash
python sensor_simulator.py
```

## How It Works

### 1. Python Script (`sensor_simulator.py`)
- Generates simulated sensor data (voltage, current, power)
- Sends HTTP POST request to Node.js backend
- Uses `requests` library for HTTP communication

### 2. Node.js Backend (`/api/sensor/reading`)
- Receives sensor data from Python
- Authenticates using device token
- Validates port ownership
- Saves reading to database using Sequelize
- Runs phantom detection logic
- Creates notifications if phantom energy detected
- Updates port status automatically

### 3. Database (`db.js`)
- Uses existing Sequelize connection
- All data saved through ORM (not direct SQL)
- Maintains relationships and constraints

## Configuration Options

### Change Reading Interval
```python
READING_INTERVAL = 5  # Send reading every 5 seconds
```

### Change Backend URL
```python
NODE_SERVER_URL = "http://your-server:3000/api/sensor/reading"
```

### Change Voltage/Current Range
```python
voltage = round(random.uniform(220.0, 240.0), 2)  # Adjust range
amps = round(random.uniform(0.3, 0.8), 3)          # Adjust range
```

## API Endpoint Details

### Endpoint: `POST /api/sensor/reading`

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

**Response:**
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

## Troubleshooting

### Connection Error
- Make sure Node.js backend is running on port 3000
- Check if firewall is blocking the connection
- Verify `NODE_SERVER_URL` is correct

### Authentication Error
- Verify device token is correct
- Make sure device exists in database
- Check if device token hasn't expired

### Port Not Found
- Verify port ID is correct
- Make sure port belongs to the device's user
- Check if port exists in database

### Database Connection
- The Python script does NOT connect to database directly
- All database operations happen through Node.js backend
- Make sure `db.js` is configured correctly in backend

## Advantages of This Approach

1. **Centralized Logic**: All business logic (phantom detection, notifications) in Node.js
2. **Security**: Device authentication through tokens
3. **Consistency**: All data goes through Sequelize ORM
4. **Scalability**: Easy to add more Python scripts or devices
5. **Maintainability**: Single source of truth for database operations

## Next Steps

1. Replace simulated data with real Arduino readings
2. Use `pyserial` library to read from actual Arduino
3. Add error handling and retry logic
4. Implement data buffering for offline scenarios
5. Add logging and monitoring

## Example: Real Arduino Integration

```python
import serial
import requests
import json

# Connect to Arduino
arduino = serial.Serial('COM3', 9600)  # Change port as needed

while True:
    if arduino.in_waiting > 0:
        # Read data from Arduino
        line = arduino.readline().decode('utf-8').strip()
        data = json.loads(line)
        
        # Send to Node.js backend
        payload = {
            "deviceToken": DEVICE_TOKEN,
            "portId": PORT_ID,
            "voltage": data["voltage"],
            "current": data["current"],
            "power": data["power"]
        }
        
        response = requests.post(NODE_SERVER_URL, json=payload)
        print(f"Sent: {data} | Status: {response.status_code}")
```

