package com.example.multiaccount.service;

import com.example.multiaccount.model.Item;
import com.example.multiaccount.repo.ItemRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class ItemService {
    private final ItemRepository repo;
    private final RedisTemplate<String, Object> redisTemplate;
    private final EventPublisher publisher;

    public ItemService(ItemRepository repo, RedisTemplate<String, Object> redisTemplate, EventPublisher publisher) {
        this.repo = repo;
        this.redisTemplate = redisTemplate;
        this.publisher = publisher;
    }

    @Transactional
    public Item create(Item item) {
        item.setCreatedAt(Instant.now());
        Item saved = repo.save(item);
        // publish event (using RabbitMQ in local compose)
        publisher.publish("item.created", saved);
        // Store full item object in Redis cache with 1 hour expiry
        try {
            String key = cacheKey(saved.getId());
            redisTemplate.opsForValue().set(key, saved, 1, TimeUnit.HOURS);
            System.out.println("✅ Cached item in Redis: " + key);
        } catch (Exception e) {
            System.out.println("⚠️ Redis unavailable, skipping cache: " + e.getMessage());
        }
        return saved;
    }

    public Optional<Item> get(Long id) {
        String key = cacheKey(id);
        try {
            // Try to get full Item object from Redis cache
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null && cached instanceof Item) {
                System.out.println("✅ Cache HIT for: " + key);
                return Optional.of((Item) cached);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Redis unavailable, fetching from DB: " + e.getMessage());
        }
        
        // Cache miss - fetch from database and cache it
        System.out.println("❌ Cache MISS for: " + key);
        Optional<Item> item = repo.findById(id);
        item.ifPresent(i -> {
            try {
                redisTemplate.opsForValue().set(key, i, 1, TimeUnit.HOURS);
                System.out.println("✅ Cached item from DB: " + key);
            } catch (Exception e) {
                System.out.println("⚠️ Failed to cache: " + e.getMessage());
            }
        });
        return item;
    }

    @Transactional
    public Item update(Long id, Item upd) {
        Item exist = repo.findById(id).orElseThrow();
        exist.setName(upd.getName());
        exist.setDescription(upd.getDescription());
        Item saved = repo.save(exist);
        
        // Update cache with new data
        try {
            String key = cacheKey(id);
            redisTemplate.opsForValue().set(key, saved, 1, TimeUnit.HOURS);
            System.out.println("✅ Updated cache for: " + key);
        } catch (Exception e) {
            System.out.println("⚠️ Redis unavailable, skipping cache update: " + e.getMessage());
        }
        
        publisher.publish("item.updated", saved);
        return saved;
    }

    private String cacheKey(Long id) { return "item:" + id; }
}
