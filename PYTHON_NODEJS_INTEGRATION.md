# Python to Node.js Integration - Complete Step-by-Step Guide

## Overview

This document explains the complete process of integrating a Python script with your Node.js/Express backend for the Phantom Energy Detection system.

## Architecture Flow

```
Python Script → HTTP POST → Node.js Backend → Sequelize ORM → MySQL Database
                                    ↓
                         (Phantom Detection Logic)
                                    ↓
                         (Notifications & Events)
```

## Why This Approach?

1. **Centralized Logic**: All business logic (phantom detection, notifications) stays in Node.js
2. **Security**: Device authentication through tokens, no direct database access
3. **Consistency**: All data goes through Sequelize ORM using existing `db.js` connection
4. **Maintainability**: Single source of truth, easy to update and debug
5. **Scalability**: Easy to add more Python scripts or devices

## Complete Step-by-Step Process

### Step 1: Backend Setup (Node.js)

#### 1.1 Create Sensor Controller

**File:** `Backend/src/controllers/sensorController.js`

This controller:
- Receives sensor data from Python script
- Authenticates device using token
- Validates port ownership
- Saves reading to database using Sequelize
- Runs phantom detection logic
- Creates notifications if phantom energy detected
- Updates port status automatically

**Key Points:**
- Uses existing `PowerReading` model
- Uses existing `Port` model
- Uses existing `DeviceAuthToken` model
- All database operations through Sequelize (uses `db.js`)
- No direct MySQL connection needed

#### 1.2 Create Sensor Routes

**File:** `Backend/src/routes/sensorRoutes.js`

This route:
- Defines `/api/sensor/reading` endpoint
- No authentication middleware (token in request body)
- Calls sensor controller

#### 1.3 Update App.js

**File:** `Backend/src/app.js`

Add sensor routes:
```javascript
const sensorRoutes = require('./routes/sensorRoutes');
app.use('/api/sensor', sensorRoutes);
```

### Step 2: Python Script Setup

#### 2.1 Install Dependencies

```bash
cd Python
pip install -r requirements.txt
```

This installs:
- `requests` - For HTTP communication with Node.js

#### 2.2 Configure Script

**File:** `Python/sensor_simulator.py`

Update configuration:
```python
DEVICE_TOKEN = "your-device-token-here"  # From frontend
PORT_ID = "your-port-uuid-here"          # From frontend
NODE_SERVER_URL = "http://localhost:3000/api/sensor/reading"
READING_INTERVAL = 2  # seconds
```

#### 2.3 Run Script

```bash
python sensor_simulator.py
```

### Step 3: Get Device Token and Port ID

#### 3.1 Start Backend

```bash
cd Backend
npm start
```

Backend should be running on `http://localhost:3000`

#### 3.2 Start Frontend

```bash
cd frontend
npm run dev
```

Frontend should be running on `http://localhost:5173`

#### 3.3 Login to Frontend

1. Open browser: `http://localhost:5173`
2. Login with your credentials

#### 3.4 Get Device Token

1. Go to **Devices** page
2. Create a new device or use existing one
3. Click the **"Token"** button
4. Copy the device token (shown in alert)

#### 3.5 Get Port ID

1. Go to **Ports** page
2. Create a new port or use existing one
3. Note the Port ID (you can find it by:
   - Inspecting element in browser DevTools
   - Checking database
   - Creating port and checking Network tab response)

### Step 4: Run Python Script

1. Update `sensor_simulator.py` with device token and port ID
2. Run script:
   ```bash
   python sensor_simulator.py
   ```

3. You should see output like:
   ```
   ✅ Success -> Voltage: 230.5V | Current: 0.45A | Power: 103.73W
   ✅ Success -> Voltage: 229.8V | Current: 0.52A | Power: 119.50W
   ```

## How Data Flows

### 1. Python Script Generates Data

```python
# Generate simulated sensor data
voltage = 230.5  # Volts
current = 0.45   # Amps
power = 103.73   # Watts
```

### 2. Python Script Sends HTTP POST Request

```python
payload = {
    "deviceToken": "device-token-uuid",
    "portId": "port-uuid",
    "voltage": 230.5,
    "current": 0.45,
    "power": 103.73
}

response = requests.post(
    "http://localhost:3000/api/sensor/reading",
    json=payload
)
```

### 3. Node.js Backend Receives Request

**File:** `Backend/src/controllers/sensorController.js`

```javascript
// Receives request body
const { deviceToken, portId, voltage, current, power } = req.body;

// Authenticates device
const deviceTokenRecord = await DeviceAuthToken.findOne({
    where: { token: deviceToken }
});

// Validates port
const port = await Port.findByPk(portId);

// Saves reading to database using Sequelize
const reading = await PowerReading.create({
    portId: portId,
    voltage: voltage,
    current: current,
    power: power,
    timestamp: new Date()
});
```

### 4. Database Operations (via Sequelize)

**File:** `Backend/src/config/db.js`

```javascript
// Existing database connection
const sequelize = new Sequelize(
    process.env.DB_NAME || 'phantom_energy_conservation',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'Sowmiya@1040',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        // ... connection options
    }
);
```

**Key Points:**
- Python script does NOT connect to MySQL directly
- All database operations go through Sequelize ORM
- Uses existing `db.js` connection
- Maintains relationships and constraints
- Ensures data consistency

### 5. Phantom Detection Logic

```javascript
// Detects phantom energy
if (power < port.threshold && power > 0) {
    // Create phantom event
    await PhantomEvent.create({
        portId: portId,
        detected_power: power,
        detected_at: new Date(),
        action_taken: 'auto_cut'
    });
    
    // Create notification
    await Notification.create({
        userId: port.userId,
        portId: portId,
        message: `Phantom energy detected on ${port.name}`
    });
    
    // Update port status
    await port.update({ status: 'off' });
}
```

### 6. Response to Python Script

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

## Database Connection

### Important: Python Does NOT Connect to Database

The Python script does **NOT** connect to MySQL directly. Instead:

1. **Python** sends HTTP POST request to Node.js
2. **Node.js** receives request and processes it
3. **Node.js** uses Sequelize ORM to connect to MySQL (via `db.js`)
4. **Sequelize** handles all database operations
5. **MySQL** stores the data

### Why This Approach?

1. **Security**: No database credentials in Python script
2. **Consistency**: All data goes through Sequelize ORM
3. **Relationships**: Maintains data relationships and constraints
4. **Business Logic**: All logic stays in Node.js
5. **Maintainability**: Single database connection (`db.js`)

## Key Files

### Backend Files

1. **`Backend/src/controllers/sensorController.js`**
   - Handles sensor data from Python
   - Authenticates device
   - Saves to database
   - Runs phantom detection logic

2. **`Backend/src/routes/sensorRoutes.js`**
   - Defines `/api/sensor/reading` endpoint
   - Routes requests to controller

3. **`Backend/src/app.js`**
   - Registers sensor routes
   - Handles CORS and middleware

4. **`Backend/src/config/db.js`**
   - Database connection (existing)
   - Used by Sequelize ORM
   - Python script does NOT use this

### Python Files

1. **`Python/sensor_simulator.py`**
   - Generates simulated sensor data
   - Sends HTTP POST requests to Node.js
   - Handles errors and retries

2. **`Python/requirements.txt`**
   - Lists Python dependencies
   - Only needs `requests` library

3. **`Python/README.md`**
   - Setup instructions
   - Configuration guide
   - Troubleshooting tips

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Make sure Node.js backend is running
   - Check if backend is on port 3000
   - Verify firewall is not blocking

2. **Authentication Error**
   - Verify device token is correct
   - Make sure device exists in database
   - Generate new device token from frontend

3. **Port Not Found**
   - Verify port ID is correct
   - Make sure port exists in database
   - Check if port belongs to device's user

4. **Database Connection Error**
   - Python script does NOT connect to database
   - All database operations happen through Node.js
   - Check `db.js` configuration in backend
   - Verify MySQL is running and accessible

## Advantages

1. **Centralized Logic**: All business logic in Node.js
2. **Security**: Device authentication, no direct database access
3. **Consistency**: All data through Sequelize ORM
4. **Maintainability**: Single source of truth
5. **Scalability**: Easy to add more Python scripts or devices

## Summary

This integration allows Python scripts to send sensor data to your Node.js backend, which then:
- Authenticates the device
- Validates the port
- Saves data to database using Sequelize (via `db.js`)
- Runs phantom detection logic
- Creates notifications
- Updates port status

**Important:** The Python script does NOT connect to MySQL directly. All database operations go through the Node.js backend using Sequelize ORM, which uses the existing `db.js` connection.

