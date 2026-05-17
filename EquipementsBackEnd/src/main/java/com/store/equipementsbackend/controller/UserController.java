package com.store.equipementsbackend.controller;

import com.store.equipementsbackend.model.AppUser;
import com.store.equipementsbackend.model.Equipment;
import com.store.equipementsbackend.service.EquipmentService;
import com.store.equipementsbackend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final EquipmentService equipmentService;

    public UserController(UserService userService, EquipmentService equipmentService) {
        this.userService = userService;
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public List<AppUser> getAll() {
        log.debug("GET /api/users — liste de tous les utilisateurs");
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppUser> getById(@PathVariable String id) {
        log.debug("GET /api/users/{}", id);
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/{id}/equipment")
    public List<Equipment> getEquipment(@PathVariable String id) {
        log.debug("GET /api/users/{}/equipment — équipements de l'utilisateur", id);
        return equipmentService.findByEmployee(id);
    }
}
