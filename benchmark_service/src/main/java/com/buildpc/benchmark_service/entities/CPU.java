package com.buildpc.benchmark_service.entities;

import com.google.type.DateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CPU {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private String generation;
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
	private Integer recommenderPower;
	private DateTime releaseDate;
	private Float averagePrice;

	private DateTime updatedAt;
	private DateTime createdAt;
}
