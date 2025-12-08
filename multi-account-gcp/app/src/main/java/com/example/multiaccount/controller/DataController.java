package com.example.multiaccount.controller;

import com.example.multiaccount.model.Item;
import com.example.multiaccount.repo.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;
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
            return itemRepository.findAll();
        } catch (Exception e) {
            log.error("Error fetching SQL data", e);
            return new ArrayList<>();
        }
    }

    @GetMapping("/redis")
    public List<Map<String, Object>> getRedisData() {
        List<Map<String, Object>> redisData = new ArrayList<>();

        try {
            if (redisTemplate != null) {
                Set<String> keys = redisTemplate.keys("item:*");
                if (keys != null) {
                    for (String key : keys) {
                        Map<String, Object> entry = new HashMap<>();
                        entry.put("key", key);
                        entry.put("value", redisTemplate.opsForValue().get(key));
                        entry.put("ttl", redisTemplate.getExpire(key, TimeUnit.SECONDS) + "s");
                        redisData.add(entry);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error fetching Redis data", e);
        }

        return redisData;
    }

    @GetMapping("/bucket")
    public List<Map<String, Object>> getBucketData() {
        return FileUploadController.getUploadedFiles();
    }
}
