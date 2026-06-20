package com.buildpc.benchmark_service.entities;

import com.google.type.DateTime;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mother_boards")
@EntityListeners(AuditingEntityListener.class)
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

	@Column(name = "max_ram")
	private Integer maxRAM;
	private Float maxRamMemoryFrequencyMhz;
	private Integer pciExpress;
	private Integer M2Slots;
	private Integer vrm;
	private Float avgPrice;
	private Integer score;
	private byte[] img;

	@LastModifiedDate
	private LocalDateTime updatedAt;

	@CreatedDate
	private LocalDateTime createdAt;
}
