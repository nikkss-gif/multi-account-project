package com.example.multiaccount.repo;

import com.example.multiaccount.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}
