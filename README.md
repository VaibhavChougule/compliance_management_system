# Supplier Compliance API

This is a FastAPI application for managing supplier information and compliance records, with AI-driven insights using Google's Generative AI. The application connects to a PostgreSQL database to store supplier data and compliance metrics, providing endpoints to add, retrieve, and analyze supplier information.

## Features

- **Supplier Management**: Create and retrieve supplier details, including name, country, contract terms, compliance score, and last audit date.
- **Compliance Tracking**: Record and retrieve compliance metrics for suppliers, including metrics, results, and statuses.
- **AI-Powered Insights**: Generate actionable insights and recommendations based on compliance history using Google's Gemini model.
- **CORS Support**: Configured to allow cross-origin requests for flexible frontend integration.
- **RESTful API**: Provides endpoints for CRUD operations and compliance analysis.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React JS
- **Database**: PostgreSQL
- **AI Integration**: Google Generative AI (Gemini model)
- **Dependencies**: FastAPI, Uvicorn, psycopg2-binary, Pydantic, google-generativeai, python-dotenv
- **Python Version**: 3.8+

## Prerequisites

- Python 3.8 or higher
- PostgreSQL database running on `localhost:5432` with database name `postgres`, user `postgres`, and password `pass123` (or as configured in `.env`)
- Google Generative AI API key

## Installation

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   pip install fastapi uvicorn psycopg2-binary pydantic google-generativeai python-dotenv
   
2. **Create .env file**:
    ```bash
    DB_NAME=postgres
    DB_USER=postgres
    DB_PASSWORD=pass123
    DB_HOST=localhost
    DB_PORT=5432
    GOOGLE_API_KEY=your-google-api-key
    ```
3. **Run FastAPI Server**:
   ```bash
     uvicorn main:app --reload
   ```

4. **Frontend (Run React application)**:
   ```bash
     cd frontend
     npm install
     npm run dev
   
    
