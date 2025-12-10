# create_admin_hash.py - For manual admin user creation
import sys
import os
from datetime import datetime
from pathlib import Path

# Add the parent directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Try to import from your auth module
try:
    from app.auth import get_password_hash
except ImportError:
    # Fallback if direct import fails
    from auth import get_password_hash

from sqlalchemy.orm import Session
from database import SessionLocal
from app.models.models import User

def create_admin_user(password="admin123"):
    """Create or update admin user in the database"""
    db = SessionLocal()
    
    try:
        print(f"\n{'='*60}")
        print("Creating/Updating Admin User")
        print(f"{'='*60}")
        
        # Hash the password
        print(f"Plain password: {password}")
        hashed_password = get_password_hash(password)
        print(f"Hashed password: {hashed_password[:50]}...")
        
        # Check if admin already exists
        admin = db.query(User).filter(User.username == "admin").first()
        
        if admin:
            # Update existing admin
            admin.password = hashed_password
            print("✓ Updated existing admin user password")
        else:
            # Create new admin user
            admin_user = User(
                username="admin",
                password=hashed_password,
                full_name="System Administrator",
                role="admin",
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(admin_user)
            print("✓ Created new admin user")
        
        db.commit()
        
        # Verify
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print(f"\n✅ Admin user {'updated' if admin.id else 'created'} successfully!")
            print(f"ID: {admin.id}")
            print(f"Username: {admin.username}")
            print(f"Full Name: {admin.full_name}")
            print(f"Role: {admin.role}")
            print(f"Is Active: {admin.is_active}")
        else:
            print("\n❌ Failed to create admin user")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def interactive_mode():
    """Interactive mode to create admin user"""
    print("\n" + "="*60)
    print("HMS Alpha - Admin User Creation Tool")
    print("="*60)
    
    choice = input("\nDo you want to use default password 'admin123'? (y/n): ").lower()
    
    if choice == 'y' or choice == '':
        password = "admin123"
    else:
        while True:
            password = input("Enter new admin password: ").strip()
            if len(password) < 4:
                print("Password must be at least 4 characters long. Try again.")
                continue
            
            confirm = input("Confirm password: ").strip()
            if password == confirm:
                break
            else:
                print("Passwords don't match. Try again.")
    
    create_admin_user(password)

if __name__ == "__main__":
    interactive_mode()
    input("\nPress Enter to exit...")