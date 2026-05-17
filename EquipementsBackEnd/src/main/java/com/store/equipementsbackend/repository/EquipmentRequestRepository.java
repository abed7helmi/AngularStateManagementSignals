package com.store.equipementsbackend.repository;

import com.store.equipementsbackend.model.EquipmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRequestRepository extends JpaRepository<EquipmentRequest, String> {
    List<EquipmentRequest> findByEmployeeId(String employeeId);
}
