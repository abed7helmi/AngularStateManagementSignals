package com.store.equipementsbackend.model;

import jakarta.persistence.*;

@Entity
public class EquipmentRequest {

    @Id
    private String id;

    private String employeeId;

    @Enumerated(EnumType.STRING)
    private EquipmentCategory category;

    @Column(length = 200)
    private String description;

    @Column(length = 500)
    private String justification;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private String requestDate;
    private String responseDate;

    @Column(length = 300)
    private String adminNote;

    private String assignedEquipmentId;

    public EquipmentRequest() {}

    public EquipmentRequest(String id, String employeeId, EquipmentCategory category,
                            String description, String justification, RequestStatus status,
                            String requestDate, String responseDate, String adminNote,
                            String assignedEquipmentId) {
        this.id = id;
        this.employeeId = employeeId;
        this.category = category;
        this.description = description;
        this.justification = justification;
        this.status = status;
        this.requestDate = requestDate;
        this.responseDate = responseDate;
        this.adminNote = adminNote;
        this.assignedEquipmentId = assignedEquipmentId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public EquipmentCategory getCategory() { return category; }
    public void setCategory(EquipmentCategory category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public String getRequestDate() { return requestDate; }
    public void setRequestDate(String requestDate) { this.requestDate = requestDate; }
    public String getResponseDate() { return responseDate; }
    public void setResponseDate(String responseDate) { this.responseDate = responseDate; }
    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    public String getAssignedEquipmentId() { return assignedEquipmentId; }
    public void setAssignedEquipmentId(String assignedEquipmentId) { this.assignedEquipmentId = assignedEquipmentId; }
}
