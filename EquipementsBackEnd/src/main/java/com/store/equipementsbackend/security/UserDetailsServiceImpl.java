package com.store.equipementsbackend.security;

import com.store.equipementsbackend.model.AppUser;
import com.store.equipementsbackend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Appelé par Spring Security lors du login (username = email). */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + email));
        return build(user);
    }

    /** Appelé par JwtAuthenticationFilter pour chaque requête authentifiée. */
    public UserDetails loadUserById(String id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + id));
        return build(user);
    }

    private UserDetails build(AppUser user) {
        return new User(
                user.getId(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name().toUpperCase()))
        );
    }
}
