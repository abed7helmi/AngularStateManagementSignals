package com.store.equipementsbackend.controller;

import com.store.equipementsbackend.dto.AuthResponse;
import com.store.equipementsbackend.dto.LoginRequest;
import com.store.equipementsbackend.model.AppUser;
import com.store.equipementsbackend.repository.UserRepository;
import com.store.equipementsbackend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationManager authManager,
                          UserRepository userRepository,
                          JwtTokenProvider tokenProvider) {
        this.authManager = authManager;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        log.info("Tentative de connexion pour : {}", req.email());
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        } catch (BadCredentialsException e) {
            log.warn("Échec de connexion pour : {} — identifiants incorrects", req.email());
            return ResponseEntity.status(401).body("Email ou mot de passe incorrect");
        }

        AppUser user = userRepository.findByEmail(req.email()).orElseThrow();
        String token = tokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole().name());

        log.info("Connexion réussie pour : {} (rôle : {})", user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(
                token, user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getDepartment(), user.getPosition()));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me() {
        var principal = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUsername();

        log.debug("Récupération du profil pour userId : {}", userId);
        AppUser user = userRepository.findById(userId).orElseThrow();
        return ResponseEntity.ok(new AuthResponse(
                null, user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getDepartment(), user.getPosition()));
    }
}
