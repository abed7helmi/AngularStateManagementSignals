package com.store.equipementsbackend.repository;

import com.store.equipementsbackend.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, String> {
    // Spring Data JPA traverse la relation assignedUser → id
    List<Equipment> findByAssignedUserId(String userId);
}
