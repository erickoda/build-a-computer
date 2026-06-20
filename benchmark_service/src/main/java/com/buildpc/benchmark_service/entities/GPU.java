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
@Table(name = "gpus")
@EntityListeners(AuditingEntityListener.class)
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
	private String memoryGen;
	private Integer cores;
	private Integer pciExpress;
	private Integer recommendedPower;
	private LocalDateTime releaseDate;
	private Float avgPrice;
	private byte[] img;

	@CreatedDate
	private LocalDateTime createdAt;

	@LastModifiedDate
	private LocalDateTime updatedAt;
}
