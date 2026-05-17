package com.store.equipementsbackend.controller;

import com.store.equipementsbackend.model.EquipmentCategory;
import com.store.equipementsbackend.model.EquipmentRequest;
import com.store.equipementsbackend.service.EquipmentRequestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class EquipmentRequestController {

    private static final Logger log = LoggerFactory.getLogger(EquipmentRequestController.class);

    private final EquipmentRequestService service;

    public EquipmentRequestController(EquipmentRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<EquipmentRequest> getAll() {
        log.debug("GET /api/requests — liste de toutes les demandes");
        return service.findAll();
    }

    @GetMapping("/employee/{employeeId}")
    public List<EquipmentRequest> getByEmployee(@PathVariable String employeeId) {
        log.debug("GET /api/requests/employee/{} — demandes de l'employé", employeeId);
        return service.findByEmployee(employeeId);
    }

    @PostMapping
    public ResponseEntity<EquipmentRequest> submit(@RequestBody Map<String, String> body) {
        log.info("POST /api/requests — nouvelle demande de l'employé {} pour catégorie {}",
                body.get("employeeId"), body.get("category"));
        EquipmentRequest created = service.submit(
                body.get("employeeId"),
                EquipmentCategory.valueOf(body.get("category")),
                body.get("description"),
                body.get("justification")
        );
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<EquipmentRequest> approve(@PathVariable String id,
                                                     @RequestBody Map<String, String> body) {
        log.info("PUT /api/requests/{}/approve — approbation avec équipement {}", id, body.get("equipmentId"));
        return ResponseEntity.ok(service.approve(id, body.get("equipmentId"), body.get("adminNote")));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<EquipmentRequest> reject(@PathVariable String id,
                                                    @RequestBody Map<String, String> body) {
        log.info("PUT /api/requests/{}/reject — refus de la demande", id);
        return ResponseEntity.ok(service.reject(id, body.get("adminNote")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable String id) {
        log.info("DELETE /api/requests/{} — annulation de la demande", id);
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
