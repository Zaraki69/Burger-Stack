package com.example.order;

import org.springframework.web.bind.annotation.*;

@RestController
public class OrderController {

    @PostMapping("/orders")
    public String createOrder() {
        return "Order created";
    }

    @GetMapping("/orders/{id}")
    public String getOrder(@PathVariable String id) {
        return "Order " + id;
    }

    @GetMapping("/health")
    public String health() {
        return "ok";
    }
}