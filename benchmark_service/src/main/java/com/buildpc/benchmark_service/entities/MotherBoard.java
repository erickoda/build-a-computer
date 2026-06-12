package com.buildpc.benchmark_service.entities;

import com.google.type.DateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.sql.Date;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MotherBoard {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private String series;
	private String socket;
	private String ddr;
	private Integer memorySlots;
	private Integer maxRAM;
	private Integer maxRamFrequency;
	private Integer pciExpress;
	private Integer maxM2Slots;
	private Integer vrms;
	private Float averagePrice;
	private Integer score;
	private byte[] image;
	private Date updatedAt;
	private Date createdAt;
}
