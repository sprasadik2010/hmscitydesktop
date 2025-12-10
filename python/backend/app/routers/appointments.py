from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from ...database import get_db
from auth import get_current_user
from models import Appointment, Patient, Doctor
from .schemas import AppointmentCreate

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("/")
async def create_appointment(
    appointment_data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == appointment_data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Check if doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == appointment_data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Check if token number already exists for same doctor and date
    existing_appointment = db.query(Appointment).filter(
        Appointment.doctor_id == appointment_data.doctor_id,
        db.func.date(Appointment.appointment_date) == db.func.date(appointment_data.appointment_date),
        Appointment.token_number == appointment_data.token_number
    ).first()
    
    if existing_appointment:
        raise HTTPException(status_code=400, detail="Token number already exists for this doctor")
    
    # Create appointment
    db_appointment = Appointment(**appointment_data.dict())
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    return {
        "message": "Appointment created successfully",
        "appointment_id": db_appointment.id
    }

@router.get("/")
async def get_appointments(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    doctor_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Appointment)
    
    if start_date:
        query = query.filter(db.func.date(Appointment.appointment_date) >= start_date)
    
    if end_date:
        query = query.filter(db.func.date(Appointment.appointment_date) <= end_date)
    
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    
    if status:
        query = query.filter(Appointment.status == status)
    
    appointments = query.order_by(Appointment.appointment_date).all()
    
    # Add patient and doctor details
    result = []
    for appointment in appointments:
        appointment_dict = {
            "id": appointment.id,
            "appointment_date": appointment.appointment_date,
            "token_number": appointment.token_number,
            "status": appointment.status,
            "notes": appointment.notes,
            "patient_id": appointment.patient_id,
            "patient_name": appointment.patient.name if appointment.patient else None,
            "patient_phone": appointment.patient.phone if appointment.patient else None,
            "doctor_id": appointment.doctor_id,
            "doctor_name": appointment.doctor.name if appointment.doctor else None,
            "doctor_specialty": appointment.doctor.specialty if appointment.doctor else None
        }
        result.append(appointment_dict)
    
    return result

@router.put("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: int,
    status: str = Query(..., regex="^(Scheduled|Completed|Cancelled|No Show)$"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = status
    db.commit()
    
    return {"message": f"Appointment status updated to {status}"}

@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(appointment)
    db.commit()
    
    return {"message": "Appointment deleted successfully"}