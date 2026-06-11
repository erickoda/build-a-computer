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
public class GPU {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private String family;
	private String series;
	private Integer memoryAmount;
	private String memoryGeneration;
	private Integer cores;
	private Integer pciExpress;
	private Integer recommenderPower;
	private DateTime releaseDate;
	private Float averagePrice;

	private DateTime updatedAt;
	private DateTime createdAt;
}
