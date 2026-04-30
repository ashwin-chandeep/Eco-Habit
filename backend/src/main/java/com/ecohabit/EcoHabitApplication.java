package com.ecohabit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EcoHabitApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcoHabitApplication.class, args);
    }

}