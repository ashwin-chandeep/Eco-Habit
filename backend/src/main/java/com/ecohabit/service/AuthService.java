package com.ecohabit.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecohabit.dto.JwtResponse;
import com.ecohabit.dto.LoginRequest;
import com.ecohabit.dto.RegisterRequest;
import com.ecohabit.entity.User;
import com.ecohabit.repository.UserRepository;
import com.ecohabit.security.JwtUtils;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder encoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        // Allow login by username or email; normalize input
        String identifier = loginRequest.getUsername().trim();
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(identifier, loginRequest.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User user = (User) authentication.getPrincipal();
        
        return new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), 
                              user.getFirstName(), user.getLastName(), user.getRole());
    }
    
    public User registerUser(RegisterRequest signUpRequest) {
        // Normalize inputs to prevent case-variant duplicates
        String normalizedUsername = signUpRequest.getUsername().trim().toLowerCase();
        String normalizedEmail = signUpRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        
        // Create new user's account with normalized username/email
        User user = new User(normalizedUsername,
                           normalizedEmail,
                           encoder.encode(signUpRequest.getPassword()));
        
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        
        return userRepository.save(user);
    }
}