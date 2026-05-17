package com.store.equipementsbackend.dto;

import com.store.equipementsbackend.model.UserRole;

public record AuthResponse(
    String token,
    String id,
    String name,
    String email,
    UserRole role,
    String department,
    String position
) {}
