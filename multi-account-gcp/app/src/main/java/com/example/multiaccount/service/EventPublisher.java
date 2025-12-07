package com.example.multiaccount.service;

import com.example.multiaccount.model.Item;
import com.example.multiaccount.controller.WorkerController;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class EventPublisher {
    private static final Logger log = LoggerFactory.getLogger(EventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public EventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(String topic, Item item) {
        try {
            log.info("Publishing event for item ID: {} with topic: {}", item.getId(), topic);
            rabbitTemplate.convertAndSend("exchange", topic, item.getId());
            
            // Log the worker activity
            WorkerController.addWorkerLog(item.getId(), 
                "Event published to RabbitMQ - Topic: " + topic);
            
            log.info("Event published successfully for item: {}", item.getId());
        } catch (Exception e) {
            log.error("Failed to publish event for item: {}", item.getId(), e);
            WorkerController.addWorkerLog(item.getId(), 
                "Failed to publish event - Error: " + e.getMessage());
        }
    }
}
