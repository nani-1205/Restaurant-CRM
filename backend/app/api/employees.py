# backend/app/api/employees.py
from flask import Blueprint, request, jsonify
from ..models import Employee
from .. import db

employees_bp = Blueprint('employees', __name__)

# Get all employees
@employees_bp.route('/', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    return jsonify([{
        'id': emp.id,
        'name': emp.name,
        'role': emp.role,
        'hire_date': emp.hire_date.isoformat(),
        'performance_score': emp.performance_score
    } for emp in employees])

# Add a new employee
@employees_bp.route('/', methods=['POST'])
def add_employee():
    data = request.get_json()
    if not data or not 'name' in data or not 'role' in data:
        return jsonify({'error': 'Missing data'}), 400
        
    new_employee = Employee(
        name=data['name'],
        role=data['role'],
        performance_score=data.get('performance_score', 80)
    )
    db.session.add(new_employee)
    db.session.commit()
    
    return jsonify({
        'id': new_employee.id,
        'name': new_employee.name,
        'role': new_employee.role
    }), 201

# Update an employee
@employees_bp.route('/<int:id>', methods=['PUT'])
def update_employee(id):
    employee = Employee.query.get_or_404(id)
    data = request.get_json()
    
    employee.name = data.get('name', employee.name)
    employee.role = data.get('role', employee.role)
    employee.performance_score = data.get('performance_score', employee.performance_score)
    
    db.session.commit()
    return jsonify({'message': 'Employee updated successfully'})

# Delete an employee
@employees_bp.route('/<int:id>', methods=['DELETE'])
def delete_employee(id):
    employee = Employee.query.get_or_404(id)
    db.session.delete(employee)
    db.session.commit()
    return jsonify({'message': 'Employee deleted successfully'})