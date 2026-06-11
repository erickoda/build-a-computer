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
public class Storage {
	enum SSDType {
		SATA,
		M2_SATA,
		M2_NVME
	}

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private String series;
	private Integer memoryAmount;
	private SSDType type;
	private Integer reading;
	private Integer writing;
	private Float averagePrice;
	private Integer score;

	private DateTime updatedAt;
	private DateTime createdAt;
}
