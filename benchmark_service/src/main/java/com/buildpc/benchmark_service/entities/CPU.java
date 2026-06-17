package com.buildpc.benchmark_service.entities;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cpus")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CPU {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private String gen;
	private String family;
	private String series;
	private Integer cores;
	private Integer threads;
	private Float baseClock;
	private Float maxClock;
	private Integer cache;
	private String socket;
	private Boolean graphics;
	private Boolean oc;
	private Integer recommendedPower;
	private LocalDateTime releaseDate;
	private Float avgPrice;
	private byte[] img;

	@CreatedDate
	private LocalDateTime createdAt;

	@LastModifiedDate
	private LocalDateTime updatedAt;
}
