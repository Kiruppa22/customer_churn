# Customer Churn Prediction System

## Overview
This project predicts whether a customer is likely to leave (churn) using
customer data such as contract type, tenure and monthly charges.

## Tech Stack
- Backend: Python, FastAPI
- Database: MySQL
- Frontend: React
- Data: customer_churn.csv

## Project Structure
- `database/` – database connection and models
- `sql/` – SQL scripts for creating tables
- `phase1` to `phase6` – step-by-step development phases
- `routers/`, `schemas/`, `services/` – API routes, data validation, business logic
- `react-app/` – frontend user interface
- `main.py` – application entry point

## Setup
1. Clone the repository
2. Create a virtual environment and run `pip install -r requirements.txt`
3. Create the MySQL database and run the scripts in `sql/`
4. Start the backend: `uvicorn main:app --reload`
5. Start the frontend: `cd react-app && npm install && npm start`
