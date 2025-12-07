package com.example.multiaccount.worker;

import jakarta.persistence.*;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
public class EventListener {
    private final DerivedRepo repo;

    public EventListener(DerivedRepo repo) { this.repo = repo; }

    @RabbitListener(queues = "queue")
    @Transactional
    public void handle(Long itemId) {
        Derived d = new Derived();
        d.setItemId(itemId);
        d.setProcessedAt(Instant.now());
        d.setNote("processed");
        repo.save(d);
    }
}
