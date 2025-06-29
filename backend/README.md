Supplier Compliance API
This is a FastAPI application for managing supplier information and compliance records, with AI-driven insights using Google's Generative AI. The application connects to a PostgreSQL database to store supplier data and compliance metrics, providing endpoints to add, retrieve, and analyze supplier information.
Features

Supplier Management: Create and retrieve supplier details, including name, country, contract terms, compliance score, and last audit date.
Compliance Tracking: Record and retrieve compliance metrics for suppliers, including metrics, results, and statuses.
AI-Powered Insights: Generate actionable insights and recommendations based on compliance history using Google's Gemini model.
CORS Support: Configured to allow cross-origin requests for flexible frontend integration.
RESTful API: Provides endpoints for CRUD operations and compliance analysis.

Tech Stack

Backend: FastAPI (Python)
Database: PostgreSQL
AI Integration: Google Generative AI (Gemini model)
Dependencies: Pydantic, psycopg2, google-genai
Python Version: 3.8+

Prerequisites

Python 3.8 or higher
PostgreSQL database running on localhost:5432 with database name postgres, user postgres, and password pass123
Google Generative AI API key

Installation

Clone the Repository:
git clone <repository-url>
cd <repository-directory>


Create a Virtual Environment:
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


Install Dependencies:
pip install fastapi uvicorn psycopg2-binary pydantic google-generativeai


Set Up PostgreSQL:

Ensure PostgreSQL is installed and running.
Create a database named postgres and configure the user and password as specified in the code (user=postgres, password=pass123).
The application automatically creates the required suppliers and compliance_records tables on startup.


Configure Google Generative AI:

Obtain an API key from Google Cloud for the Generative AI service.
Replace the placeholder API key in the code (AIzaSyC_3CeBGhpmxtQx1kN5AwYFFu2SAVSVkLg) with your actual API key.



Running the Application

Start the FastAPI Server:
uvicorn main:app --reload


The server will run at http://127.0.0.1:8000.
The --reload flag enables auto-reload for development.


Access the API:

Open http://127.0.0.1:8000/docs in your browser to access the interactive Swagger UI for testing endpoints.
Alternatively, use tools like curl or Postman to interact with the API.



Database Schema
suppliers Table



Column
Type
Description



id
SERIAL
Primary key, auto-incremented


name
VARCHAR(255)
Supplier name


country
VARCHAR(255)
Supplier country


contract_terms
JSONB
Contract terms in JSON format


compliance_score
NUMERIC(5,2)
Compliance score (e.g., 85.50)


last_audit
DATE
Date of the last audit


compliance_records Table



Column
Type
Description



id
SERIAL
Primary key, auto-incremented


supplier_id
INTEGER
Foreign key referencing suppliers(id)


metric
VARCHAR(255)
Compliance metric (e.g., "Delivery Time")


date_recorded
DATE
Date the metric was recorded


result
VARCHAR(255)
Result of the metric (e.g., "On Time")


status
VARCHAR(50)
Status (e.g., "Pass", "Fail")


API Endpoints
General

GET /: Health check endpoint. Returns a welcome message or an error if the database connection fails.

Suppliers

POST /suppliers: Add a new supplier.
Request Body: { "name": str, "country": str, "contract_terms": dict, "compliance_score": float, "last_audit": "YYYY-MM-DD" }
Response: { "status": "success", "message": "Supplier added successfully" }


GET /suppliers: Retrieve all suppliers.
Response: List of suppliers with their details.


GET /suppliers/{supplier_id}: Retrieve a supplier by ID.
Response: Supplier details or 404 if not found.



Compliance

POST /suppliers/check-compliance: Submit compliance metrics for a supplier and get AI-generated analysis.
Request Body: { "supplier_id": int, "compliance_date": "YYYY-MM-DD", "metrics": [{ "metric": str, "result": str, "status": str }] }
Response: { "response": str, "alerts": [] }


GET /compliance_records/{supplier_id}: Retrieve compliance records for a supplier.
Response: List of compliance records.



Insights

GET /suppliers/insights/{supplier_id}: Generate AI-driven insights based on compliance history.
Response: { "supplier_id": int, "insights": str }



Example Usage
Add a Supplier
curl -X POST "http://127.0.0.1:8000/suppliers" -H "Content-Type: application/json" -d '{
  "name": "Acme Corp",
  "country": "USA",
  "contract_terms": {"term": "Net 30"},
  "compliance_score": 85.5,
  "last_audit": "2025-01-01"
}'

Check Compliance
curl -X POST "http://127.0.0.1:8000/suppliers/check-compliance" -H "Content-Type: application/json" -d '{
  "supplier_id": 1,
  "compliance_date": "2025-06-29",
  "metrics": [
    {"metric": "Delivery Time", "result": "On Time", "status": "Pass"},
    {"metric": "Quality Check", "result": "Defective Rate 2%", "status": "Fail"}
  ]
}'

Get Insights
curl -X GET "http://127.0.0.1:8000/suppliers/insights/1"

Notes

Ensure the PostgreSQL database is running and accessible before starting the application.
Replace the Google Generative AI API key with a valid one to enable AI-driven insights.
The application assumes the database connection details are correct (localhost:5432, postgres, pass123). Update the connection parameters in the code if needed.
Error handling is implemented for database and AI failures, returning appropriate HTTP status codes and messages.
