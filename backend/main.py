from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
import uuid
import random
import string

app = FastAPI(
    title="SmartFix Tanzania API",
    description="Device Repair Booking Platform for Tanzania",
    version="1.0.0"
)

# ─── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: set to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── IN-MEMORY DATABASE (Replace with PostgreSQL in production) ──
db_users = {}
db_bookings = {}
db_technicians = {
    "TECH-001": {
        "id": "TECH-001",
        "name": "John Mwangi",
        "specialty": ["Smartphone", "Tablet"],
        "rating": 4.9,
        "jobs_done": 312,
        "distance_km": 1.2,
        "is_available": True,
        "phone": "+255712000001",
        "location": "Kariakoo, Dar es Salaam"
    },
    "TECH-002": {
        "id": "TECH-002",
        "name": "Amina Salehe",
        "specialty": ["Laptop", "Printer"],
        "rating": 4.8,
        "jobs_done": 198,
        "distance_km": 2.5,
        "is_available": True,
        "phone": "+255712000002",
        "location": "Mikocheni, Dar es Salaam"
    },
    "TECH-003": {
        "id": "TECH-003",
        "name": "Peter Kimaro",
        "specialty": ["Smartphone", "Laptop", "Tablet"],
        "rating": 4.7,
        "jobs_done": 445,
        "distance_km": 3.1,
        "is_available": True,
        "phone": "+255712000003",
        "location": "Kinondoni, Dar es Salaam"
    },
}

PRICING = {
    "Smartphone": {"labour": 12000, "parts": 20000, "service_fee": 2000},
    "Laptop":     {"labour": 18000, "parts": 30000, "service_fee": 2000},
    "Tablet":     {"labour": 14000, "parts": 22000, "service_fee": 2000},
    "Printer":    {"labour": 10000, "parts": 15000, "service_fee": 2000},
    "Other":      {"labour": 10000, "parts": 10000, "service_fee": 2000},
}

# ─── MODELS ────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    location: Optional[str] = None

class BookingCreate(BaseModel):
    user_phone: str
    device: str
    problem_description: str
    technician_id: Optional[str] = None
    appointment_date: str
    payment_method: str  # mpesa | airtel | card | flutterwave | stripe

class PaymentInitiate(BaseModel):
    booking_id: str
    payment_method: str
    phone_number: Optional[str] = None  # for mobile money
    amount: float

class TrackingUpdate(BaseModel):
    booking_id: str
    stage: int  # 1-5
    notes: Optional[str] = None

# ─── HELPERS ───────────────────────────────────────────────
def generate_tracking_id():
    year = datetime.now().year
    num = ''.join(random.choices(string.digits, k=5))
    return f"SFX-{year}-{num}"

def calculate_price(device: str):
    p = PRICING.get(device, PRICING["Other"])
    return {
        "labour": p["labour"],
        "parts": p["parts"],
        "service_fee": p["service_fee"],
        "total": p["labour"] + p["parts"] + p["service_fee"]
    }

# ─── ROUTES ────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "SmartFix Tanzania API v1.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# ── Users ──────────────────────────────────────────────────
@app.post("/api/users/register")
def register_user(user: UserRegister):
    user_id = str(uuid.uuid4())[:8].upper()
    db_users[user.phone] = {
        "id": user_id,
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "location": user.location,
        "created_at": datetime.now().isoformat()
    }
    return {"success": True, "user_id": user_id, "message": "Registration successful"}

@app.get("/api/users/{phone}")
def get_user(phone: str):
    user = db_users.get(phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ── Technicians ────────────────────────────────────────────
@app.get("/api/technicians")
def list_technicians(device: Optional[str] = None):
    techs = list(db_technicians.values())
    if device:
        techs = [t for t in techs if device in t["specialty"] or "Other" in t["specialty"]]
    return {"technicians": techs, "count": len(techs)}

@app.get("/api/technicians/{tech_id}")
def get_technician(tech_id: str):
    tech = db_technicians.get(tech_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    return tech

# ── Pricing ────────────────────────────────────────────────
@app.get("/api/pricing/{device}")
def get_pricing(device: str):
    return {"device": device, "pricing": calculate_price(device)}

# ── Bookings ───────────────────────────────────────────────
@app.post("/api/bookings")
def create_booking(booking: BookingCreate):
    tracking_id = generate_tracking_id()
    booking_id = str(uuid.uuid4())[:8].upper()
    price = calculate_price(booking.device)

    db_bookings[tracking_id] = {
        "id": booking_id,
        "tracking_id": tracking_id,
        "user_phone": booking.user_phone,
        "device": booking.device,
        "problem_description": booking.problem_description,
        "technician_id": booking.technician_id,
        "technician_name": db_technicians.get(booking.technician_id, {}).get("name", "TBD"),
        "appointment_date": booking.appointment_date,
        "payment_method": booking.payment_method,
        "payment_status": "pending",
        "repair_status": "booked",
        "repair_stage": 1,
        "price": price,
        "created_at": datetime.now().isoformat(),
        "timeline": [
            {"stage": 1, "label": "Booking Confirmed", "status": "done", "timestamp": datetime.now().isoformat()},
            {"stage": 2, "label": "Technician Assigned", "status": "pending", "timestamp": None},
            {"stage": 3, "label": "Repair In Progress", "status": "pending", "timestamp": None},
            {"stage": 4, "label": "Quality Check", "status": "pending", "timestamp": None},
            {"stage": 5, "label": "Repair Complete", "status": "pending", "timestamp": None},
        ]
    }

    return {
        "success": True,
        "tracking_id": tracking_id,
        "booking_id": booking_id,
        "price": price,
        "message": "Booking created successfully! SMS confirmation sent."
    }

@app.get("/api/bookings/track/{tracking_id}")
def track_booking(tracking_id: str):
    booking = db_bookings.get(tracking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Tracking ID not found")
    return booking

@app.get("/api/bookings/user/{phone}")
def get_user_bookings(phone: str):
    bookings = [b for b in db_bookings.values() if b["user_phone"] == phone]
    return {"bookings": bookings, "count": len(bookings)}

@app.put("/api/bookings/update-stage")
def update_repair_stage(update: TrackingUpdate):
    booking = None
    for b in db_bookings.values():
        if b["id"] == update.booking_id:
            booking = b
            break
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    stage_labels = {1: "Booking Confirmed", 2: "Technician Assigned", 3: "Repair In Progress", 4: "Quality Check", 5: "Repair Complete"}
    booking["repair_stage"] = update.stage
    booking["repair_status"] = "complete" if update.stage == 5 else "in_progress"
    for item in booking["timeline"]:
        if item["stage"] <= update.stage:
            item["status"] = "done"
            if item["stage"] == update.stage:
                item["timestamp"] = datetime.now().isoformat()
    return {"success": True, "message": f"Stage updated to: {stage_labels.get(update.stage, 'Unknown')}"}

# ── Payments ───────────────────────────────────────────────
@app.post("/api/payments/initiate")
def initiate_payment(payment: PaymentInitiate):
    """
    In production this integrates with:
    - Flutterwave API for M-Pesa / Airtel Money / mobile money
    - Stripe API for Visa/Mastercard
    """
    booking = None
    for b in db_bookings.values():
        if b["id"] == payment.booking_id:
            booking = b
            break
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Simulate payment reference
    pay_ref = "PAY-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

    if payment.payment_method in ["mpesa", "airtel", "tigopesa"]:
        # Flutterwave mobile money flow
        return {
            "success": True,
            "provider": "Flutterwave",
            "payment_ref": pay_ref,
            "instruction": f"Check your phone {payment.phone_number} for a payment prompt",
            "amount": payment.amount,
            "currency": "TZS"
        }
    elif payment.payment_method in ["card", "stripe"]:
        # Stripe card flow
        return {
            "success": True,
            "provider": "Stripe",
            "payment_ref": pay_ref,
            "checkout_url": f"https://checkout.stripe.com/pay/{pay_ref}",  # real URL in production
            "amount": payment.amount,
            "currency": "TZS"
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported payment method")

@app.post("/api/payments/confirm/{booking_id}")
def confirm_payment(booking_id: str):
    for b in db_bookings.values():
        if b["id"] == booking_id:
            b["payment_status"] = "paid"
            return {"success": True, "message": "Payment confirmed"}
    raise HTTPException(status_code=404, detail="Booking not found")

# ── Admin ──────────────────────────────────────────────────
@app.get("/api/admin/stats")
def admin_stats():
    total = len(db_bookings)
    paid = sum(1 for b in db_bookings.values() if b["payment_status"] == "paid")
    revenue = sum(b["price"]["total"] for b in db_bookings.values() if b["payment_status"] == "paid")
    return {
        "total_bookings": total,
        "paid_bookings": paid,
        "pending_bookings": total - paid,
        "total_revenue_tzs": revenue,
        "active_technicians": len([t for t in db_technicians.values() if t["is_available"]]),
        "technician_count": len(db_technicians),
    }
