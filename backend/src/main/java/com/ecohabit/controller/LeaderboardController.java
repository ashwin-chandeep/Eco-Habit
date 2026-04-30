package com.ecohabit.controller;

import com.ecohabit.dto.LeaderboardEntry;
import com.ecohabit.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/leaderboard")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(
            @RequestParam(name = "metric", required = false, defaultValue = "points") String metric,
            @RequestParam(name = "limit", required = false, defaultValue = "100") int limit
    ) {
        List<LeaderboardEntry> entries = leaderboardService.getLeaderboard(metric, limit);
        return ResponseEntity.ok(entries);
    }
}