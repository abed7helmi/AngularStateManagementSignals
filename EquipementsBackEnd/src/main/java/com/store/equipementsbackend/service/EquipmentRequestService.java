package com.store.equipementsbackend.service;

import com.store.equipementsbackend.model.*;
import com.store.equipementsbackend.repository.EquipmentRepository;
import com.store.equipementsbackend.repository.EquipmentRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class EquipmentRequestService {

    private static final Logger log = LoggerFactory.getLogger(EquipmentRequestService.class);

    private final EquipmentRequestRepository requestRepo;
    private final EquipmentRepository equipmentRepo;

    public EquipmentRequestService(EquipmentRequestRepository requestRepo,
                                   EquipmentRepository equipmentRepo) {
        this.requestRepo = requestRepo;
        this.equipmentRepo = equipmentRepo;
    }

    public List<EquipmentRequest> findAll() {
        List<EquipmentRequest> list = requestRepo.findAll();
        log.debug("findAll() — {} demande(s) trouvée(s)", list.size());
        return list;
    }

    public List<EquipmentRequest> findByEmployee(String employeeId) {
        List<EquipmentRequest> list = requestRepo.findByEmployeeId(employeeId);
        log.debug("findByEmployee({}) — {} demande(s)", employeeId, list.size());
        return list;
    }

    @Transactional
    public EquipmentRequest submit(String employeeId, EquipmentCategory category,
                                   String description, String justification) {
        EquipmentRequest req = new EquipmentRequest(
                "r" + UUID.randomUUID().toString().replace("-", "").substring(0, 8),
                employeeId, category, description, justification,
                RequestStatus.pending, LocalDate.now().toString(),
                null, null, null
        );
        EquipmentRequest saved = requestRepo.save(req);
        log.info("Demande soumise : id={}, employé={}, catégorie={}", saved.getId(), employeeId, category);
        return saved;
    }

    @Transactional
    public EquipmentRequest approve(String requestId, String equipmentId, String adminNote) {
        EquipmentRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> {
                    log.warn("Demande introuvable pour approbation : {}", requestId);
                    return new RuntimeException("Request not found: " + requestId);
                });
        Equipment eq = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> {
                    log.warn("Équipement introuvable pour approbation : {}", equipmentId);
                    return new RuntimeException("Equipment not found: " + equipmentId);
                });

        req.setStatus(RequestStatus.approved);
        req.setResponseDate(LocalDate.now().toString());
        req.setAdminNote(adminNote != null && !adminNote.isBlank() ? adminNote : "Approuvé");
        req.setAssignedEquipmentId(equipmentId);

        eq.setStatus(EquipmentStatus.assigned);
        eq.setAssignedTo(req.getEmployeeId());

        equipmentRepo.save(eq);
        EquipmentRequest saved = requestRepo.save(req);
        log.info("Demande {} approuvée — équipement {} assigné à {}", requestId, equipmentId, req.getEmployeeId());
        return saved;
    }

    @Transactional
    public EquipmentRequest reject(String requestId, String adminNote) {
        EquipmentRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> {
                    log.warn("Demande introuvable pour refus : {}", requestId);
                    return new RuntimeException("Request not found: " + requestId);
                });
        req.setStatus(RequestStatus.rejected);
        req.setResponseDate(LocalDate.now().toString());
        req.setAdminNote(adminNote);
        EquipmentRequest saved = requestRepo.save(req);
        log.info("Demande {} refusée — motif : {}", requestId, adminNote);
        return saved;
    }

    @Transactional
    public void cancel(String requestId) {
        EquipmentRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> {
                    log.warn("Demande introuvable pour annulation : {}", requestId);
                    return new RuntimeException("Request not found: " + requestId);
                });
        if (req.getStatus() != RequestStatus.pending) {
            log.warn("Tentative d'annulation d'une demande non-pending : {} (statut={})", requestId, req.getStatus());
            throw new RuntimeException("Only pending requests can be cancelled");
        }
        requestRepo.deleteById(requestId);
        log.info("Demande {} annulée", requestId);
    }
}
