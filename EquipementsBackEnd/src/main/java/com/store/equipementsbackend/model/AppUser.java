package com.store.equipementsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    private String id;

    private String name;
    private String email;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String department;
    private String position;

    @OneToMany(mappedBy = "assignedUser", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Equipment> equipmentList = new ArrayList<>();

    public AppUser() {}

    public AppUser(String id, String name, String email, String password,
                   UserRole role, String department, String position) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.position = position;
    }

    public String getId()         { return id; }
    public void setId(String id)  { this.id = id; }
    public String getName()       { return name; }
    public void setName(String n) { this.name = n; }
    public String getEmail()      { return email; }
    public void setEmail(String e){ this.email = e; }
    public String getPassword()   { return password; }
    public void setPassword(String p) { this.password = p; }
    public UserRole getRole()     { return role; }
    public void setRole(UserRole r){ this.role = r; }
    public String getDepartment() { return department; }
    public void setDepartment(String d) { this.department = d; }
    public String getPosition()   { return position; }
    public void setPosition(String p)   { this.position = p; }
    public List<Equipment> getEquipmentList() { return equipmentList; }
    public void setEquipmentList(List<Equipment> l) { this.equipmentList = l; }
}
