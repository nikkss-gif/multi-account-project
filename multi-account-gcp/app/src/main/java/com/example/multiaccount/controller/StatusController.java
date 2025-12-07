package com.example.multiaccount.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.*;

@RestController
@RequestMapping("/v1/status")
public class StatusController {

    private static final Logger log = LoggerFactory.getLogger(StatusController.class);
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;
    
    @GetMapping("/services")
    public Map<String, String> getServiceStatus() {
        Map<String, String> status = new HashMap<>();
        
        // Check database connection
        try {
            Connection conn = dataSource.getConnection();
            conn.close();
            status.put("database", "✅ Connected");
        } catch (Exception e) {
            status.put("database", "❌ Connection failed");
        }
        
        // Check Redis connection
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().get("health-check");
                status.put("redis", "✅ Connected");
            } else {
                status.put("redis", "❌ Not configured");
            }
        } catch (Exception e) {
            status.put("redis", "❌ Connection failed");
        }
        
        // Check RabbitMQ connection
        try {
            if (rabbitTemplate != null) {
                rabbitTemplate.getConnectionFactory().createConnection().close();
                status.put("rabbitmq", "✅ Connected");
            } else {
                status.put("rabbitmq", "❌ Not configured");
            }
        } catch (Exception e) {
            status.put("rabbitmq", "❌ Connection failed");
        }
        
        status.put("backend", "✅ Online");
        
        log.info("Service status check completed");
        return status;
    }
    
    @GetMapping("/cache")
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            if (redisTemplate != null) {
                // Get Redis info - simplified stats
                Set<String> keys = redisTemplate.keys("item:*");
                int totalKeys = keys != null ? keys.size() : 0;
                
                stats.put("totalKeys", totalKeys);
                stats.put("hitRate", "85%"); // Mock data - Redis doesn't easily expose hit rate
                stats.put("memoryUsed", "12.5 MB");
                stats.put("connected", true);
            } else {
                stats.put("totalKeys", 0);
                stats.put("hitRate", "N/A");
                stats.put("memoryUsed", "N/A");
                stats.put("connected", false);
            }
            
        } catch (Exception e) {
            stats.put("totalKeys", 0);
            stats.put("hitRate", "N/A");
            stats.put("memoryUsed", "N/A");
            stats.put("connected", false);
            log.error("Error getting cache stats", e);
        }
        
        return stats;
    }
    
    @GetMapping("/rabbitmq")
    public Map<String, Object> getRabbitMqStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Mock RabbitMQ stats - in real implementation you'd use RabbitMQ Management API
            stats.put("queueName", "item.events");
            stats.put("messageCount", 0);
            stats.put("consumerCount", 1);
            stats.put("published", 5);
            stats.put("delivered", 5);
            stats.put("lastMessage", "Item created: ID 1");
            stats.put("status", "✅ Active");
            
        } catch (Exception e) {
            stats.put("queueName", "item.events");
            stats.put("messageCount", "N/A");
            stats.put("consumerCount", 0);
            stats.put("published", "N/A");
            stats.put("delivered", "N/A");
            stats.put("lastMessage", "Connection failed");
            stats.put("status", "❌ Offline");
            log.error("Error getting RabbitMQ stats", e);
        }
        
        return stats;
    }
}