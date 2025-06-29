from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import psycopg2
from psycopg2 import OperationalError
import json
from fastapi import Path
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Connection and Table Creation ---
conn = None
try:
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    print("✅ Database connection successful.")

    # Create suppliers table if it doesn't exist (assuming it might not be created yet)
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS suppliers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                country VARCHAR(255) NOT NULL,
                contract_terms JSONB,
                compliance_score NUMERIC(5, 2),
                last_audit DATE
            );
        """)
        conn.commit()
    print("✅ 'suppliers' table checked/created successfully.")

    # Create compliance_records table if it doesn't exist
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS compliance_records (
                id SERIAL PRIMARY KEY,
                supplier_id INTEGER NOT NULL,
                metric VARCHAR(255) NOT NULL,
                date_recorded DATE NOT NULL,
                result VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            );
        """)
        conn.commit()
    print("✅ 'compliance_records' table checked/created successfully.")

except OperationalError as e:
    print(f"❌ Database connection or table creation failed: {e}")
    conn = None # Ensure conn is None if connection fails

# --- Pydantic Models ---
class Supplier(BaseModel):
    name: str
    country: str
    contract_terms: Dict[str, str]
    compliance_score: float
    last_audit: str  # format: "YYYY-MM-DD"

class SupplierOut(Supplier):
    id: int

class ComplianceMetric(BaseModel):
    metric: str
    result: str
    status: str

class ComplianceRequest(BaseModel):
    supplier_id: int
    compliance_date: str # New field for the date
    metrics: List[ComplianceMetric]

# Model for retrieving compliance records (optional, but good for completeness)
class ComplianceRecordOut(BaseModel):
    id: int
    supplier_id: int
    metric: str
    date_recorded: str
    result: str
    status: str

class InsightsResponse(BaseModel):
    supplier_id: int
    insights: str
    
# Initialize the Google GenAI client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# --- Routes ---
@app.get("/")
def home():
    if conn is None:
        return {"status": "error", "message": "Database connection not established."}
    return {"status": "success", "message": "Welcome to the Supplier API"}

@app.post("/suppliers")
def add_supplier(supplier: Supplier):
    if conn is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        audit_date = datetime.strptime(supplier.last_audit, "%Y-%m-%d").date()

        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO suppliers (name, country, contract_terms, compliance_score, last_audit)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                supplier.name,
                supplier.country,
                json.dumps(supplier.contract_terms),
                supplier.compliance_score,
                audit_date
            ))
            conn.commit()

        return {"status": "success", "message": "Supplier added successfully"}
    except Exception as e:
        print("Error inserting supplier:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suppliers", response_model=List[SupplierOut])
def get_suppliers():
    if conn is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, country, contract_terms, compliance_score, last_audit FROM suppliers")
            rows = cur.fetchall()

        result = []
        for row in rows:
            result.append({
                "id": row[0],
                "name": row[1],
                "country": row[2],
                "contract_terms": row[3],
                "compliance_score": row[4],
                "last_audit": row[5].strftime("%Y-%m-%d")
            })
        return result

    except Exception as e:
        print("Error fetching suppliers:", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve suppliers")
    

@app.get("/suppliers/{supplier_id}", response_model=SupplierOut)
def get_supplier_by_id(supplier_id: int = Path(..., title="Supplier ID", ge=1)):
    if conn is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, name, country, contract_terms, compliance_score, last_audit
                FROM suppliers
                WHERE id = %s
            """, (supplier_id,))
            row = cur.fetchone()

        if row is None:
            raise HTTPException(status_code=404, detail="Supplier not found")

        return {
            "id": row[0],
            "name": row[1],
            "country": row[2],
            "contract_terms": row[3],
            "compliance_score": row[4],
            "last_audit": row[5].strftime("%Y-%m-%d")
        }

    except Exception as e:
        print("Error retrieving supplier:", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve supplier")


@app.post("/suppliers/check-compliance")
def check_compliance(data: ComplianceRequest):
    if conn is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        # Parse the compliance date
        compliance_date = datetime.strptime(data.compliance_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid compliance_date format. Use YYYY-MM-DD.")

    # Store compliance metrics in the database
    try:
        with conn.cursor() as cur:
            for metric_data in data.metrics:
                cur.execute("""
                    INSERT INTO compliance_records (supplier_id, metric, date_recorded, result, status)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    data.supplier_id,
                    metric_data.metric,
                    compliance_date,
                    metric_data.result,
                    metric_data.status
                ))
            conn.commit()
        print(f"✅ Compliance records for supplier {data.supplier_id} on {compliance_date} stored successfully.")
    except Exception as db_e:
        print(f"Error storing compliance records in DB: {db_e}")
        raise HTTPException(status_code=500, detail=f"Failed to store compliance records: {db_e}")

    # Prepare text for AI analysis
    metrics_text = "\n".join(
        f"- {m.metric}: {m.result} ({m.status})" for m in data.metrics
    )

    prompt = f"""
You are a supplier compliance auditor. Analyze the following compliance metrics for supplier ID {data.supplier_id}, recorded on {data.compliance_date}:

{metrics_text}

Identify any patterns, potential risks, or issues such as frequent late deliveries or inconsistent quality. Give a summary in bullet points.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_budget=0)
            ),
        )
        print(response.text)

        return {
            "response": response.text,
            "alerts": [] # You can populate this with AI-generated alerts if desired
        }

    except Exception as e:
        print("GenAI error:", e)
        # You might want to differentiate between AI error and DB error in the response
        raise HTTPException(status_code=500, detail="GenAI analysis failed.")

@app.get("/compliance_records/{supplier_id}", response_model=List[ComplianceRecordOut])
def get_compliance_records_by_supplier(supplier_id: int = Path(..., title="Supplier ID", ge=1)):
    if conn is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, supplier_id, metric, date_recorded, result, status
                FROM compliance_records
                WHERE supplier_id = %s
                ORDER BY date_recorded DESC;
            """, (supplier_id,))
            rows = cur.fetchall()

        result = []
        for row in rows:
            result.append({
                "id": row[0],
                "supplier_id": row[1],
                "metric": row[2],
                "date_recorded": row[3].strftime("%Y-%m-%d"),
                "result": row[4],
                "status": row[5]
            })
        return result
    except Exception as e:
        print("Error fetching compliance records:", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve compliance records")

@app.get("/suppliers/insights/{supplier_id}", response_model=InsightsResponse)
def get_supplier_insights(supplier_id: int = Path(..., title="Supplier ID", ge=1)):
    if conn is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        # Fetch compliance history for the supplier
        with conn.cursor() as cur:
            cur.execute("""
                SELECT metric, date_recorded, result, status
                FROM compliance_records
                WHERE supplier_id = %s
                ORDER BY date_recorded DESC, id DESC;
            """, (supplier_id,))
            compliance_history_rows = cur.fetchall()

        if not compliance_history_rows:
            raise HTTPException(status_code=404, detail=f"No compliance records found for supplier ID {supplier_id}.")

        # Format compliance history for the AI prompt
        history_text = "\n".join(
            f"- Date: {row[1].strftime('%Y-%m-%d')}, Metric: {row[0]}, Result: {row[2]}, Status: {row[3]}"
            for row in compliance_history_rows
        )

        prompt = f"""
You are a supply chain analyst providing strategic insights.
Analyze the following historical compliance data for supplier ID {supplier_id}:

Compliance History:
{history_text}

Based on this data, provide actionable suggestions in bullet points to:
1.  Improve the supplier's overall compliance.
2.  Adjust future contract terms to mitigate identified risks or incentivize better performance.
Be concise and focus on concrete recommendations.
"""

        # Get insights from the AI model
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_budget=0)
            ),
        )
        
        insights_text = response.text
        
        return {
            "supplier_id": supplier_id,
            "insights": insights_text
        }

    except HTTPException as he:
        raise he # Re-raise HTTPExceptions (e.g., 404 not found)
    except Exception as e:
        print(f"Error generating insights for supplier {supplier_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {e}")
