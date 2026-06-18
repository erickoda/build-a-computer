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
@Table(name = "ram_memories")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RAM {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private Integer memoryAmount;
	private Integer frequencyMhz;
	private String series;
	private String ddr;
	private Float averagePrice;
	private byte[] image;

	@LastModifiedDate
	private LocalDateTime updatedAt;

	@CreatedDate
	private LocalDateTime createdAt;
}
