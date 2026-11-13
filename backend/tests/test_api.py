import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "U65992KA2018PTC112345" in data["cin"]

def test_demo_accounts():
    response = client.get("/api/v1/auth/demo-accounts")
    assert response.status_code == 200
    accounts = response.json()["demo_accounts"]
    assert len(accounts) >= 3
    roles = [a["role"] for a in accounts]
    assert "ADMIN" in roles
    assert "STAFF" in roles
    assert "CUSTOMER" in roles

def test_login_owner():
    response = client.post(
        "/api/v1/auth/login",
        json={"email_or_phone": "owner@sowbhagyachits.in", "password": "Password@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"

def test_chit_plans():
    response = client.get("/api/v1/chits/plans")
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) >= 8
    # Check 50k, 1L, 5L, 20L
    values = [float(p["chit_value"]) for p in plans]
    assert 50000.0 in values
    assert 100000.0 in values
    assert 500000.0 in values
    assert 2000000.0 in values

def test_loan_products():
    response = client.get("/api/v1/loans/products")
    assert response.status_code == 200
    prods = response.json()
    assert len(prods) >= 3

def test_emi_calculator():
    response = client.get("/api/v1/loans/calculate-emi?amount=50000&tenure_months=12&annual_rate=14.5")
    assert response.status_code == 200
    res = response.json()
    assert "monthly_emi" in res
    assert res["monthly_emi"] > 0
    assert res["total_payable"] > 50000

def test_admin_dashboard_stats():
    # Login as admin
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email_or_phone": "owner@sowbhagyachits.in", "password": "Password@123"}
    )
    token = login_res.json()["access_token"]
    
    stats_res = client.get(
        "/api/v1/dashboard/admin-stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert stats_res.status_code == 200
    data = stats_res.json()
    assert data["stats"]["total_customers"] >= 2
    assert "monthly_trends" in data

