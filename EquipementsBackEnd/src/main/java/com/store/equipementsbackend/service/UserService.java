package com.store.equipementsbackend.service;

import com.store.equipementsbackend.model.AppUser;
import com.store.equipementsbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<AppUser> findAll() {
        List<AppUser> users = repository.findAll();
        log.debug("findAll() — {} utilisateur(s) trouvé(s)", users.size());
        return users;
    }

    public AppUser findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Utilisateur introuvable : {}", id);
                    return new RuntimeException("User not found: " + id);
                });
    }
}
