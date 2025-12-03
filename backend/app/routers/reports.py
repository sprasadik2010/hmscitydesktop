from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date, timedelta

from database import get_db
from .auth import get_current_user
from ..models import Patient, OPBill, IPBill, Appointment, Doctor

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/daily-op")
async def get_daily_op_report(
    report_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    bills = db.query(OPBill).filter(
        db.func.date(OPBill.bill_date) == report_date
    ).all()
    
    return bills

@router.get("/bill-summary")
async def get_bill_summary(
    start_date: date = Query(default_factory=lambda: date.today() - timedelta(days=7)),
    end_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    op_bills = db.query(OPBill).filter(
        db.func.date(OPBill.bill_date) >= start_date,
        db.func.date(OPBill.bill_date) <= end_date
    ).all()
    
    ip_bills = db.query(IPBill).filter(
        db.func.date(IPBill.bill_date) >= start_date,
        db.func.date(IPBill.bill_date) <= end_date
    ).all()
    
    return {
        "op_bills": op_bills,
        "ip_bills": ip_bills,
        "total_op_amount": sum(bill.net_amount for bill in op_bills),
        "total_ip_amount": sum(bill.net_amount for bill in ip_bills),
        "total_amount": sum(bill.net_amount for bill in op_bills + ip_bills)
    }

@router.get("/patient-list")
async def get_patient_list(
    start_date: date = Query(default_factory=lambda: date.today() - timedelta(days=30)),
    end_date: date = Query(default_factory=date.today),
    is_ip: bool = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Patient).filter(
        db.func.date(Patient.registration_date) >= start_date,
        db.func.date(Patient.registration_date) <= end_date
    )
    
    if is_ip is not None:
        query = query.filter(Patient.is_ip == is_ip)
    
    patients = query.all()
    return patients

@router.get("/appointment-list")
async def get_appointment_list(
    appointment_date: date = Query(default_factory=date.today),
    doctor_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Appointment).filter(
        db.func.date(Appointment.appointment_date) == appointment_date
    )
    
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    
    appointments = query.all()
    
    # Add patient and doctor details
    result = []
    for appointment in appointments:
        appointment_dict = {
            "id": appointment.id,
            "appointment_date": appointment.appointment_date,
            "token_number": appointment.token_number,
            "status": appointment.status,
            "notes": appointment.notes,
            "patient_name": appointment.patient.name if appointment.patient else None,
            "patient_phone": appointment.patient.phone if appointment.patient else None,
            "doctor_name": appointment.doctor.name if appointment.doctor else None,
            "doctor_specialty": appointment.doctor.specialty if appointment.doctor else None
        }
        result.append(appointment_dict)
    
    return result