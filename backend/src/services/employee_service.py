from src.repository import employees as repo

# return all employees optionally filtered by role
def get_employees(conn, role=None):
    return repo.get_all_employees(conn, role=role) or []

# fetch a single employee record by ID
def get_employee(conn, employee_id):
    return repo.get_employee_by_id(conn, employee_id)

# validate and update an employee's present or absent availability status
def set_employee_availability(conn, employee_id, status):
    employee = repo.get_employee_by_id(conn, employee_id)
    if employee is None:
        return None
    if status not in ('present', 'absent'):
        raise ValueError("Status must be 'present' or 'absent'")
    if not repo.update_employee_availability(conn, employee_id, status):
        raise RuntimeError("Failed to update availability")
    return repo.get_employee_by_id(conn, employee_id)