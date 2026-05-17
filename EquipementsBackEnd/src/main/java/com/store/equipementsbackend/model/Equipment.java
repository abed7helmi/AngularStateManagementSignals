package com.store.equipementsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
public class Equipment {

    @Id
    private String id;

    private String name;

    @Enumerated(EnumType.STRING)
    private EquipmentCategory category;

    private String brand;
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    private EquipmentStatus status;

    // Relation JPA : un Equipment appartient à 0 ou 1 AppUser
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to")
    @JsonIgnore
    private AppUser assignedUser;

    private String purchaseDate;

    @Column(length = 500)
    private String notes;

    public Equipment() {}

    public Equipment(String id, String name, EquipmentCategory category, String brand,
                     String serialNumber, EquipmentStatus status, AppUser assignedUser,
                     String purchaseDate, String notes) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.brand = brand;
        this.serialNumber = serialNumber;
        this.status = status;
        this.assignedUser = assignedUser;
        this.purchaseDate = purchaseDate;
        this.notes = notes;
    }

    // --- Sérialisation JSON : expose l'ID de l'utilisateur sous "assignedTo"
    // pour rester compatible avec le frontend Angular sans l'objet complet.
    @JsonProperty("assignedTo")
    public String getAssignedTo() {
        return assignedUser != null ? assignedUser.getId() : null;
    }

    // Permet la désérialisation depuis le corps de requête (ignoré au niveau métier,
    // l'assignation passe par le endpoint /assign).
    @JsonProperty("assignedTo")
    public void setAssignedTo(String id) {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public EquipmentCategory getCategory() { return category; }
    public void setCategory(EquipmentCategory category) { this.category = category; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public EquipmentStatus getStatus() { return status; }
    public void setStatus(EquipmentStatus status) { this.status = status; }
    public AppUser getAssignedUser() { return assignedUser; }
    public void setAssignedUser(AppUser assignedUser) { this.assignedUser = assignedUser; }
    public String getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(String purchaseDate) { this.purchaseDate = purchaseDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
