package com.example.multiaccount.worker;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DerivedRepo extends JpaRepository<Derived, Long> { }
