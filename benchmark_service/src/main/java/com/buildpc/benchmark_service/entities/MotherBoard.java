package com.buildpc.benchmark_service.entities;

import com.google.type.DateTime;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.sql.Date;
import java.util.UUID;

@Entity
@Table(name = "mother_boards")
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

	@LastModifiedDate
	private Date updatedAt;

	@CreatedDate
	private Date createdAt;
}
