package com.example.multiaccount.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/v1/worker")
public class WorkerController {

    private static final Logger log = LoggerFactory.getLogger(WorkerController.class);
    private static final List<Map<String, Object>> workerLogs = new ArrayList<>();
    
    @GetMapping("/logs")
    public List<Map<String, Object>> getWorkerLogs() {
        try {
            log.info("Fetching worker logs, current count: {}", workerLogs.size());
            return new ArrayList<>(workerLogs);
        } catch (Exception e) {
            log.error("Error fetching worker logs", e);
            return new ArrayList<>();
        }
    }
    
    // Method to add logs from worker service (called internally)
    public static void addWorkerLog(Long itemId, String note) {
        Map<String, Object> logEntry = new HashMap<>();
        logEntry.put("id", workerLogs.size() + 1);
        logEntry.put("item_id", itemId);
        logEntry.put("processed_at", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        logEntry.put("note", note != null ? note : "Item processed successfully");
        
        workerLogs.add(logEntry);
        
        // Keep only last 50 logs to prevent memory issues
        if (workerLogs.size() > 50) {
            workerLogs.remove(0);
        }
    }
    
    // Initialize with some sample data
    static {
        addWorkerLog(1L, "Initial item processed during startup");
    }
}