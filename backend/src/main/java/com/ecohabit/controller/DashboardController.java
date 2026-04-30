package com.ecohabit.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecohabit.dto.DashboardResponse;
import com.ecohabit.entity.User;
import com.ecohabit.service.DashboardService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;
    
    @GetMapping
    public ResponseEntity<DashboardResponse> getUserDashboard(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        DashboardResponse dashboard = dashboardService.getUserDashboard(user);
        return ResponseEntity.ok(dashboard);
    }
}