package com.store.equipementsbackend.controller;

import com.store.equipementsbackend.model.Equipment;
import com.store.equipementsbackend.model.EquipmentStatus;
import com.store.equipementsbackend.service.EquipmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private static final Logger log = LoggerFactory.getLogger(EquipmentController.class);

    private final EquipmentService service;

    public EquipmentController(EquipmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Equipment> getAll() {
        log.debug("GET /api/equipment — liste de tous les équipements");
        return service.findAll();
    }

    @PostMapping
    public ResponseEntity<Equipment> create(@RequestBody Equipment data) {
        log.info("POST /api/equipment — création : {}", data.getName());
        return ResponseEntity.ok(service.create(data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipment> update(@PathVariable String id, @RequestBody Equipment data) {
        log.info("PUT /api/equipment/{} — mise à jour", id);
        return ResponseEntity.ok(service.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        log.info("DELETE /api/equipment/{} — suppression", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Equipment> assign(@PathVariable String id,
                                            @RequestBody Map<String, String> body) {
        log.info("PUT /api/equipment/{}/assign — assignation à l'employé {}", id, body.get("employeeId"));
        return ResponseEntity.ok(service.assign(id, body.get("employeeId")));
    }

    @PutMapping("/{id}/unassign")
    public ResponseEntity<Equipment> unassign(@PathVariable String id) {
        log.info("PUT /api/equipment/{}/unassign — désassignation", id);
        return ResponseEntity.ok(service.unassign(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Equipment> setStatus(@PathVariable String id,
                                               @RequestBody Map<String, String> body) {
        log.info("PUT /api/equipment/{}/status — nouveau statut : {}", id, body.get("status"));
        EquipmentStatus status = EquipmentStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(service.setStatus(id, status));
    }
}
