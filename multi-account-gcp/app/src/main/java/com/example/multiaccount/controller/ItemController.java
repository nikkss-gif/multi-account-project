package com.example.multiaccount.controller;

import com.example.multiaccount.model.Item;
import com.example.multiaccount.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/v1/items")
public class ItemController {

    private final ItemService service;

    public ItemController(ItemService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Item> create(@RequestBody Item item) {
        Item saved = service.create(item);
        return ResponseEntity.created(URI.create("/v1/items/" + saved.getId())).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> get(@PathVariable Long id) {
        return service.get(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> update(@PathVariable Long id, @RequestBody Item item) {
        return ResponseEntity.ok(service.update(id, item));
    }

    @GetMapping("/health/ready")
    public ResponseEntity<String> ready() {
        return ResponseEntity.ok("ready");
    }

    @GetMapping("/info")
    public ResponseEntity<String> info() {
        return ResponseEntity.ok("backend v0.0.1");
    }
}
