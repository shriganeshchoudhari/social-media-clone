package com.example.social.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "blocks")
@Getter
@Setter
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User blocker;

    @ManyToOne(fetch = FetchType.LAZY)
    private User blocked;
}
