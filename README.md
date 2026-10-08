# Proof-of-Maintenance

## An Automated AI, IoT and Blockchain-Based Maintenance Verification System Using Proof of Work

Proof-of-Maintenance (POM) is an intelligent maintenance management and verification system designed to provide **automated, trustworthy, and tamper-evident proof of equipment maintenance**.

The system combines **IoT-based sensor monitoring, AI predictive maintenance, automation, maintenance verification, Proof of Work, and blockchain technology** into a single platform.

---

## Problem Statement

Traditional maintenance systems often depend on manually entered records. These records can be incomplete, duplicated, altered, or difficult to verify.

There is a need for a system that can:

* Automatically detect equipment problems
* Predict possible equipment failures
* Create maintenance requests automatically
* Assign suitable technicians
* Verify completed maintenance
* Measure whether maintenance was effective
* Store verified maintenance records in a tamper-evident blockchain

---

## Objectives

1. Monitor equipment health using sensor data.
2. Predict possible failures using machine learning.
3. Automatically generate maintenance requests.
4. Automatically assign technicians based on specialization and availability.
5. Verify completed maintenance records.
6. Calculate maintenance trust and effectiveness scores.
7. Validate verified maintenance using Proof of Work.
8. Store trusted records on a blockchain.
9. Detect blockchain tampering.
10. Provide QR-based maintenance verification and certificates.

---

## Key Features

### 1. IoT Sensor Monitoring

The prototype simulates equipment sensor data such as:

* Temperature
* Vibration
* Pressure
* Running hours

Sensor values are continuously updated for equipment monitoring.

### 2. AI Predictive Maintenance

A machine-learning model analyzes:

* Temperature
* Vibration
* Pressure
* Running hours

and produces a failure probability.

Example:

```text
Machine: M103
Failure Probability: 89%
Prediction: Maintenance Recommended
Risk Level: High
```

### 3. Automatic Maintenance Requests

Maintenance requests can be automatically generated when:

* Maintenance intervals are reached
* Temperature becomes critical
* Vibration becomes critical
* AI predicts high failure risk

### 4. Automatic Technician Assignment

The system selects an available technician based on equipment type and technician specialization.

Example:

```text
Equipment: Pump
Technician: T002
Status: Assigned
```

### 5. Technician Portal

Technicians can:

* View assigned tasks
* Describe maintenance work
* Record before/after conditions
* Complete maintenance requests

### 6. Automatic Verification

The system verifies:

* Maintenance request validity
* Equipment validity
* Technician assignment
* Work description
* Before condition
* After condition
* Duplicate records

A trust score is generated automatically.

Example:

```text
Trust Score: 100/100
Status: Verified
```

### 7. Maintenance Effectiveness

The system compares equipment conditions before and after maintenance.

Example:

```text
Before Temperature: 94°C
After Temperature: 68°C

Before Vibration: 7.4
After Vibration: 2.1

Effectiveness Score: 100%
Status: Effective
```

### 8. Proof of Work

Verified maintenance records are processed using a custom Proof-of-Work mechanism.

The system searches for a nonce that produces a SHA-256 hash beginning with:

```text
0000
```

Example:

```text
Nonce: 74332
Hash: 0000d302963ed9...
```

### 9. Blockchain Storage

Each verified maintenance record is stored as a blockchain block containing:

* Block number
* Timestamp
* Maintenance ID
* Technician ID
* Maintenance details
* Previous hash
* Nonce
* Current hash

### 10. Tamper Detection

The blockchain verifies:

* Previous-hash links
* Recalculated hashes
* Proof-of-Work validity

Any unauthorized modification can cause the blockchain to be marked invalid.

### 11. Blockchain Explorer

The application provides a visual blockchain explorer showing the complete chain and individual blocks.

### 12. QR Verification

Verified maintenance records can be accessed through QR-based verification.

### 13. Maintenance Certificate

A certificate page displays:

* Maintenance details
* Technician
* Before/after condition
* Effectiveness score
* Blockchain block
* Nonce
* Previous hash
* Current hash
* Proof-of-Work status

---

## End-to-End Workflow

```text
IoT Sensor Monitoring
        ↓
AI Failure Prediction
        ↓
Automatic Fault Detection
        ↓
Automatic Maintenance Request
        ↓
Automatic Technician Assignment
        ↓
Maintenance Performed
        ↓
Before/After Condition Analysis
        ↓
Automatic Verification
        ↓
Trust Score
        ↓
Maintenance Effectiveness
        ↓
Proof of Work
        ↓
SHA-256 Hash
        ↓
Blockchain Block
        ↓
Tamper Detection
        ↓
Certificate / QR Verification
```

---

## Technology Stack

| Component       | Technology               |
| --------------- | ------------------------ |
| Frontend        | HTML, CSS, JavaScript    |
| Backend         | Python Flask             |
| Database        | SQLite                   |
| AI / ML         | Python, scikit-learn     |
| Data Processing | Pandas                   |
| Hashing         | SHA-256                  |
| Blockchain      | Custom Python Blockchain |
| Consensus       | Proof of Work            |
| QR Code         | Python QR Code Library   |

---

## Project Structure

```text
POM/
│
├── app.py
├── database.py
├── sensor.py
├── ai_prediction.py
├── maintenance.py
├── assignment.py
├── verification.py
├── effectiveness.py
├── blockchain.py
├── blockchain_service.py
│
├── templates/
│   ├── dashboard.html
│   ├── technician.html
│   ├── verify.html
│   ├── blockchain.html
│   └── certificate.html
│
├── blockchain.json
├── maintenance.db
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/sadhanasankar1306-sudo/POM.git
cd POM
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install flask pandas scikit-learn qrcode[pil]
```

---

## Running the Project

Start the Flask application:

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000/
```

### Main Pages

```text
/                  → Dashboard
/technician        → Technician Portal
/verify            → Maintenance Verification
/blockchain        → Blockchain Explorer
/certificate/...   → Maintenance Certificate
```

---

## Example Equipment

The prototype can monitor equipment such as:

* Industrial Motor
* Water Pump
* Air Compressor
* Generator
* Conveyor System

Each equipment record can contain sensor readings, maintenance history, and AI predictions.

---

## Security Concept

The blockchain layer provides tamper-evident maintenance records by linking blocks through hashes.

When a maintenance record is modified after being mined:

```text
Original Data
     ↓
Original Hash

Modified Data
     ↓
Different Hash

        ↓

Blockchain Integrity Failure
```

---

## Future Enhancements

Future versions can include:

* Real ESP32/IoT hardware
* Real-time cloud data streaming
* Advanced deep-learning failure prediction
* Email/SMS notifications
* User authentication and role-based access
* Cloud deployment
* Digital signatures
* Distributed blockchain nodes
* Mobile application
* Real industrial sensor integration

---

## Project Outcome

Proof-of-Maintenance provides an automated mechanism to determine:

**whether maintenance was required, whether it was performed, whether it was effective, whether the record was verified, and whether the maintenance proof remains untampered.**

---

## Author

**Sadhana Sankar**

**Project: Proof-of-Maintenance (POM)**

**VIT — 2026**
