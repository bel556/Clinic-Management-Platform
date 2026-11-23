import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';

export default function PatientForm({
  initialData = {},
  isEdit = false,
  onSubmit,
  onCancel
}) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.patients.createPatient(payload)
  // Endpoint: POST /api/v1/patients
  // Description: Submits new patient demographics to create permanent clinic record
  // ----------------------------------------------------------------------------
  // Function: api.patients.updatePatient(patientId, payload)
  // Endpoint: PUT /api/v1/patients/${initialData.id}
  // Description: Updates patient record without affecting historical visits
  // ============================================================================

  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    gender: initialData.gender || 'Female',
    phone: initialData.phone || '',
    email: initialData.email || '',
    emergencyContact: initialData.emergencyContact || '',
    additionalInfo: initialData.additionalInfo || ''
  });

  const [errors, setErrors] = useState({});
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // Submits either create or update to backend
    onSubmit?.(formData);
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onCancel?.();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    onCancel?.();
  };

  return (
    <div className="patient-form-container" style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '24px 28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 4 }}>
            Personal information
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Fields marked * are required. {isEdit ? `Patient ID ${initialData.id || ''} is read-only.` : 'Patient ID is generated when you save.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Row 1: First Name & Last Name (Responsive 2-Col Grid) */}
            <div className="form-grid-2col">
              <Input
                label="FIRST NAME"
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="First name"
              />
              <Input
                label="LAST NAME"
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Last name"
              />
            </div>

            {/* Row 2: DOB & Gender (Responsive 2-Col Grid) */}
            <div className="form-grid-2col">
              <Input
                label="DATE OF BIRTH"
                type="date"
                required
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={errors.dateOfBirth}
              />
              <Input
                label="GENDER"
                as="select"
                required
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={['Female', 'Male', 'Non-Binary', 'Other']}
              />
            </div>

            {/* Row 3: Phone & Email (Responsive 2-Col Grid) */}
            <div className="form-grid-2col">
              <Input
                label="PHONE NUMBER"
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="0555 62 81 04 or +1 (555)..."
              />
              <Input
                label="EMAIL (OPTIONAL)"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patient@example.com"
              />
            </div>

            {/* Row 4: Emergency Contact */}
            <Input
              label="EMERGENCY CONTACT"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Contact name and phone number"
            />

            {/* Row 5: Additional Info */}
            <Input
              label="ADDITIONAL INFORMATION (OPTIONAL)"
              as="textarea"
              rows={3}
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="No additional information"
            />

            {isEdit && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                Patient ID {initialData.id || ''} is read-only. Saving updates the patient record without changing existing visits.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--color-border-subtle)',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <Button
              variant="secondary"
              type="button"
              onClick={handleCancelClick}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              {isEdit ? 'Save changes' : 'Save & create visit'}
            </Button>
          </div>
        </div>
      </form>

      {/* Discard Confirmation Modal (Page 8) */}
      <Modal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        tag="UNSAVED PATIENT"
        title="Discard this patient?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDiscardModal(false)}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={handleConfirmDiscard}>
              Discard patient
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
          Your unsaved patient information will be lost. No patient record or visit has been created.
        </p>
        <div className="modal-preview-box">
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '13.5px' }}>
            {formData.firstName || formData.lastName
              ? `${formData.firstName} ${formData.lastName}`.trim()
              : 'New Patient'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Personal information has not been saved.
          </div>
        </div>
      </Modal>
    </div>
  );
}
