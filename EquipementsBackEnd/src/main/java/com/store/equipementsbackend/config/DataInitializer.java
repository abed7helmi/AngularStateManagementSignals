package com.store.equipementsbackend.config;

import com.store.equipementsbackend.model.*;
import com.store.equipementsbackend.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepo;
    private final EquipmentRepository equipmentRepo;
    private final EquipmentRequestRepository requestRepo;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepo,
                           EquipmentRepository equipmentRepo,
                           EquipmentRequestRepository requestRepo,
                           PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.equipmentRepo = equipmentRepo;
        this.requestRepo = requestRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepo.count() > 0) return;

        // Mot de passe commun pour la démo : "password123"
        String pwd = passwordEncoder.encode("password123");

        userRepo.saveAll(List.of(
            new AppUser("u0", "Admin Système",   "admin@company.com",   pwd, UserRole.admin,    "IT",           "Administrateur Système"),
            new AppUser("u1", "Alice Martin",    "alice@company.com",   pwd, UserRole.employee, "Développement","Développeuse Frontend"),
            new AppUser("u2", "Bob Dupont",      "bob@company.com",     pwd, UserRole.employee, "Marketing",    "Chef de Projet"),
            new AppUser("u3", "Charlie Bernard", "charlie@company.com", pwd, UserRole.employee, "Développement","Développeur Backend"),
            new AppUser("u4", "Diana Rousseau",  "diana@company.com",   pwd, UserRole.employee, "RH",           "Responsable RH"),
            new AppUser("u5", "Eve Leclerc",     "eve@company.com",     pwd, UserRole.employee, "Finance",      "Analyste Financière")
        ));

        AppUser u1 = userRepo.findById("u1").orElseThrow();
        AppUser u2 = userRepo.findById("u2").orElseThrow();
        AppUser u3 = userRepo.findById("u3").orElseThrow();

        equipmentRepo.saveAll(List.of(
            new Equipment("e1",  "Dell XPS 15",         EquipmentCategory.laptop,   "Dell",     "DLL-001-2023", EquipmentStatus.assigned,    u1,   "2023-03-15", null),
            new Equipment("e2",  "MacBook Pro 14\"",    EquipmentCategory.laptop,   "Apple",    "APL-002-2023", EquipmentStatus.assigned,    u3,   "2023-05-20", null),
            new Equipment("e3",  "HP EliteBook 840",    EquipmentCategory.laptop,   "HP",       "HP-003-2022",  EquipmentStatus.available,   null, "2022-11-10", null),
            new Equipment("e4",  "Lenovo ThinkPad X1",  EquipmentCategory.laptop,   "Lenovo",   "LNV-004-2024", EquipmentStatus.available,   null, "2024-01-08", null),
            new Equipment("e5",  "LG UltraWide 34\"",   EquipmentCategory.monitor,  "LG",       "LG-005-2023",  EquipmentStatus.assigned,    u1,   "2023-03-15", null),
            new Equipment("e6",  "Dell UltraSharp 27\"",EquipmentCategory.monitor,  "Dell",     "DLL-006-2022", EquipmentStatus.assigned,    u2,   "2022-08-20", null),
            new Equipment("e7",  "Samsung 32\" 4K",     EquipmentCategory.monitor,  "Samsung",  "SAM-007-2023", EquipmentStatus.available,   null, "2023-09-01", null),
            new Equipment("e8",  "Logitech MX Keys",    EquipmentCategory.keyboard, "Logitech", "LGT-008-2023", EquipmentStatus.assigned,    u3,   "2023-06-01", null),
            new Equipment("e9",  "Keychron K2 Pro",     EquipmentCategory.keyboard, "Keychron", "KCH-009-2024", EquipmentStatus.available,   null, "2024-02-14", null),
            new Equipment("e10", "Logitech MX Master 3",EquipmentCategory.mouse,    "Logitech", "LGT-010-2023", EquipmentStatus.assigned,    u2,   "2022-08-20", null),
            new Equipment("e11", "Apple Magic Mouse",   EquipmentCategory.mouse,    "Apple",    "APL-011-2023", EquipmentStatus.available,   null, "2023-05-20", null),
            new Equipment("e12", "Sony WH-1000XM5",     EquipmentCategory.headset,  "Sony",     "SNY-012-2023", EquipmentStatus.assigned,    u1,   "2023-03-15", null),
            new Equipment("e13", "Jabra Evolve2 75",    EquipmentCategory.headset,  "Jabra",    "JBR-013-2022", EquipmentStatus.available,   null, "2022-12-01", null),
            new Equipment("e14", "iPad Pro 12.9\"",     EquipmentCategory.tablet,   "Apple",    "APL-014-2023", EquipmentStatus.available,   null, "2023-10-15", null),
            new Equipment("e15", "Dell OptiPlex 7090",  EquipmentCategory.desktop,  "Dell",     "DLL-015-2021", EquipmentStatus.maintenance, null, "2021-06-10", "En réparation — ventilateur défaillant")
        ));

        requestRepo.saveAll(List.of(
            new EquipmentRequest("r1", "u1", EquipmentCategory.monitor, "Second moniteur pour setup dual screen",
                "Amélioration de la productivité pour le développement frontend",
                RequestStatus.pending, "2026-04-25", null, null, null),
            new EquipmentRequest("r2", "u2", EquipmentCategory.headset, "Casque pour réunions Teams/Zoom",
                "Nombreuses réunions clients par semaine",
                RequestStatus.approved, "2026-04-10", "2026-04-12", "Approuvé — casque Jabra assigné", "e13"),
            new EquipmentRequest("r3", "u3", EquipmentCategory.monitor, "Moniteur additionnel",
                "Besoin de voir frontend et backend simultanément",
                RequestStatus.pending, "2026-04-26", null, null, null),
            new EquipmentRequest("r4", "u4", EquipmentCategory.tablet, "Tablette pour présentations RH",
                "Présentations lors des entretiens et formations",
                RequestStatus.rejected, "2026-04-01", "2026-04-03", "Refusé — budget non disponible ce trimestre", null),
            new EquipmentRequest("r5", "u5", EquipmentCategory.laptop, "Laptop plus performant pour analyses financières",
                "Traitement de fichiers Excel volumineux ralenti sur machine actuelle",
                RequestStatus.pending, "2026-04-27", null, null, null)
        ));
    }
}
