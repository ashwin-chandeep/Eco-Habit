package com.ecohabit.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecohabit.entity.User;
import com.ecohabit.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String normalized = identifier.trim().toLowerCase();
        User user;
        if (normalized.contains("@")) {
            user = userRepository.findByEmailIgnoreCase(normalized)
                    .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + identifier));
        } else {
            user = userRepository.findByUsernameIgnoreCase(normalized)
                    .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + identifier));
        }
        return user;
    }
}