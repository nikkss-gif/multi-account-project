package com.example.multiaccount.controller;

import com.example.multiaccount.model.Item;
import com.example.multiaccount.repo.ItemRepository;
import com.example.multiaccount.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/v1/data")
public class DataController {

    private static final Logger log = LoggerFactory.getLogger(DataController.class);
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;
    
    @GetMapping("/sql")
    public List<Item> getSqlData() {
        try {
            log.info("Fetching all items from SQL database");
            List<Item> items = itemRepository.findAll();
            log.info("Found {} items in SQL database", items.size());
            return items;
        } catch (Exception e) {
            log.error("Error fetching SQL data", e);
            return new ArrayList<>();
        }
    }
    
    @GetMapping("/redis")
    public List<Map<String, Object>> getRedisData() {
        try {
            log.info("Fetching Redis cache data");
            List<Map<String, Object>> redisData = new ArrayList<>();
            
            if (redisTemplate != null) {
                // Get all keys matching our pattern
                Set<String> keys = redisTemplate.keys("item:*");
                if (keys != null) {
                    for (String key : keys) {
                        Map<String, Object> entry = new HashMap<>();
                        entry.put("key", key);
                        
                        // Get the cached value
                        Object value = redisTemplate.opsForValue().get(key);
                        entry.put("value", value != null ? value.toString() : "null");
                        
                        // Get TTL
                        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
                        entry.put("ttl", ttl != null ? ttl + "s" : "no expiry");
                        
                        redisData.add(entry);
                    }
                }
            }
            
            log.info("Found {} Redis cache entries", redisData.size());
            return redisData;
        } catch (Exception e) {
            log.error("Error fetching Redis data", e);
            return new ArrayList<>();
        }
    }
    
    @GetMapping("/bucket")
    public List<Map<String, Object>> getBucketData() {
        try {
            log.info("Fetching file storage data");
            
            // Get uploaded files from FileUploadController
            List<Map<String, Object>> uploadedFiles = FileUploadController.getUploadedFiles();
            
            // If no files uploaded yet, show sample data
            if (uploadedFiles.isEmpty()) {
                List<Map<String, Object>> bucketData = new ArrayList<>();
                Map<String, Object> file1 = new HashMap<>();
                file1.put("name", "sample-document.pdf");
                file1.put("size", "2.5 MB");
                file1.put("uploadDate", "2024-01-15 10:30:00");
                bucketData.add(file1);
                
                Map<String, Object> file2 = new HashMap<>();
                file2.put("name", "data-export.json");
                file2.put("size", "156 KB");
                file2.put("uploadDate", "2024-01-15 09:45:00");
                bucketData.add(file2);
                
                return bucketData;
            }
            
            log.info("Found {} files in storage", uploadedFiles.size());
            return uploadedFiles;
        } catch (Exception e) {
            log.error("Error fetching bucket data", e);
            return new ArrayList<>();
        }
    }
}