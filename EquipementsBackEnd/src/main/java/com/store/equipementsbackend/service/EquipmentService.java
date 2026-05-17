package com.store.equipementsbackend.service;

import com.store.equipementsbackend.model.AppUser;
import com.store.equipementsbackend.model.Equipment;
import com.store.equipementsbackend.model.EquipmentStatus;
import com.store.equipementsbackend.repository.EquipmentRepository;
import com.store.equipementsbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EquipmentService {

    private static final Logger log = LoggerFactory.getLogger(EquipmentService.class);

    private final EquipmentRepository repository;
    private final UserRepository userRepository;

    public EquipmentService(EquipmentRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public List<Equipment> findAll() {
        List<Equipment> items = repository.findAll();
        log.debug("findAll() — {} équipement(s) trouvé(s)", items.size());
        return items;
    }

    public Equipment findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Équipement introuvable : {}", id);
                    return new RuntimeException("Equipment not found: " + id);
                });
    }

    public List<Equipment> findByEmployee(String userId) {
        List<Equipment> items = repository.findByAssignedUserId(userId);
        log.debug("findByEmployee({}) — {} équipement(s)", userId, items.size());
        return items;
    }

    @Transactional
    public Equipment create(Equipment data) {
        data.setId("e" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        data.setAssignedUser(null);
        Equipment saved = repository.save(data);
        log.info("Équipement créé : {} (id={})", saved.getName(), saved.getId());
        return saved;
    }

    @Transactional
    public Equipment update(String id, Equipment data) {
        Equipment existing = findById(id);
        existing.setName(data.getName());
        existing.setBrand(data.getBrand());
        existing.setCategory(data.getCategory());
        existing.setSerialNumber(data.getSerialNumber());
        existing.setPurchaseDate(data.getPurchaseDate());
        existing.setStatus(data.getStatus());
        existing.setNotes(data.getNotes());
        Equipment saved = repository.save(existing);
        log.info("Équipement mis à jour : {} (id={})", saved.getName(), id);
        return saved;
    }

    @Transactional
    public void delete(String id) {
        repository.deleteById(id);
        log.info("Équipement supprimé : id={}", id);
    }

    @Transactional
    public Equipment assign(String equipmentId, String employeeId) {
        Equipment eq = findById(equipmentId);
        AppUser user = userRepository.findById(employeeId)
                .orElseThrow(() -> {
                    log.warn("Employé introuvable pour assignation : {}", employeeId);
                    return new RuntimeException("User not found: " + employeeId);
                });
        eq.setAssignedUser(user);
        eq.setStatus(EquipmentStatus.assigned);
        Equipment saved = repository.save(eq);
        log.info("Équipement {} assigné à l'employé {}", equipmentId, employeeId);
        return saved;
    }

    @Transactional
    public Equipment unassign(String id) {
        Equipment eq = findById(id);
        eq.setAssignedUser(null);
        eq.setStatus(EquipmentStatus.available);
        Equipment saved = repository.save(eq);
        log.info("Équipement {} désassigné", id);
        return saved;
    }

    @Transactional
    public Equipment setStatus(String id, EquipmentStatus status) {
        Equipment eq = findById(id);
        EquipmentStatus previous = eq.getStatus();
        eq.setStatus(status);
        Equipment saved = repository.save(eq);
        log.info("Statut de l'équipement {} : {} → {}", id, previous, status);
        return saved;
    }
}
