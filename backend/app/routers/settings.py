# routers/settings.py - Minimal version
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from .auth import get_current_user
from ..models import Base, Department, Particular
from ..schemas import DepartmentCreate, DepartmentResponse, ParticularCreate, ParticularResponse

router = APIRouter(prefix="/settings", tags=["settings"])

# Departments CRUD
@router.get("/departments", response_model=List[DepartmentResponse])
async def get_departments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all departments
    """
    return db.query(Department).order_by(Department.name).all()

@router.post("/departments", response_model=DepartmentResponse)
async def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new department
    """
    # Check if department with same name exists
    existing = db.query(Department).filter(Department.name == department.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    db_department = Department(name=department.name)
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

@router.delete("/departments/{department_id}")
async def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete a department
    """
    db_department = db.query(Department).filter(Department.id == department_id).first()
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if department has particulars
    has_particulars = db.query(Particular).filter(Particular.department_id == department_id).first()
    if has_particulars:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete department with associated particulars"
        )
    
    db.delete(db_department)
    db.commit()
    return {"message": "Department deleted successfully"}

# Particulars CRUD
@router.get("/particulars", response_model=List[ParticularResponse])
async def get_particulars(
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all particulars
    """
    query = db.query(Particular)
    
    if department_id:
        query = query.filter(Particular.department_id == department_id)
    
    particulars = query.order_by(Particular.name).all()
    
    # Add department_name to each particular
    for particular in particulars:
        if particular.department:
            particular.department_name = particular.department.name
    
    return particulars

@router.post("/particulars", response_model=ParticularResponse)
async def create_particular(
    particular: ParticularCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new particular
    """
    # Check if department exists
    department = db.query(Department).filter(Department.id == particular.department_id).first()
    if not department:
        raise HTTPException(status_code=400, detail="Department not found")
    
    # Check if particular with same name exists in same department
    existing = db.query(Particular).filter(
        Particular.name == particular.name,
        Particular.department_id == particular.department_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Particular already exists in this department")
    
    db_particular = Particular(
        name=particular.name,
        department_id=particular.department_id
    )
    
    db.add(db_particular)
    db.commit()
    db.refresh(db_particular)
    
    # Add department_name to response
    db_particular.department_name = department.name
    
    return db_particular

@router.delete("/particulars/{particular_id}")
async def delete_particular(
    particular_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete a particular
    """
    db_particular = db.query(Particular).filter(Particular.id == particular_id).first()
    if not db_particular:
        raise HTTPException(status_code=404, detail="Particular not found")
    
    db.delete(db_particular)
    db.commit()
    return {"message": "Particular deleted successfully"}

@router.get("/stats")
async def get_settings_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get settings statistics
    """
    total_departments = db.query(Department).count()
    total_particulars = db.query(Particular).count()
    
    return {
        "total_departments": total_departments,
        "total_particulars": total_particulars
    }