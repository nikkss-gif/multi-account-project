package com.example.multiaccount;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;

@SpringBootApplication
public class MultiAccountApplication {

    public static void main(String[] args) {
        SpringApplication.run(MultiAccountApplication.class, args);
    }

    @Bean
    public TopicExchange exchange(){ return new TopicExchange("exchange"); }

    @Bean
    public Queue queue(){ return new Queue("queue", true); }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with("item.*");
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory cf){ return new RabbitAdmin(cf); }
}
