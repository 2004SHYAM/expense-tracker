package com.expensetracker.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * -----------------------------------------------------------------------------
 * BackendApplication
 * -----------------------------------------------------------------------------
 * This is the main entry point of your Spring Boot backend.
 * 
 * When you run the application:
 *    • SpringBootApplication tells Spring to auto-configure everything.
 *    • SpringApplication.run(...) starts the embedded server (Tomcat).
 *    • It scans your project for:
 *          - Controllers (@RestController)
 *          - Services (@Service)
 *          - Repositories (@Repository)
 *          - Security configs
 *          - MongoDB configurations
 * 
 * In short: this file boots up your entire backend like a "power button".
 * -----------------------------------------------------------------------------
 */
@SpringBootApplication
public class BackendApplication {

    /**
     * main() → the first method that runs when the backend starts.
     *
     * @param args command line arguments (usually empty)
     */
    public static void main(String[] args) {

        // This starts the Spring Boot application.
        // It creates the app context, sets up all beans, connects to MongoDB,
        // and starts the API server on port 8080.
        SpringApplication.run(BackendApplication.class, args);
    }
}
