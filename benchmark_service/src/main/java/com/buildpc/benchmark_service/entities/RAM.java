package com.buildpc.benchmark_service.entities;

import com.google.type.DateTime;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.sql.Date;
import java.util.UUID;

@Entity
@Table(name = "ram_memories")
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
	private Integer frequency;
	private String series;
	private String ddr;
	private Float averagePrice;
	private byte[] image;

	@LastModifiedDate
	private Date updatedAt;

	@CreatedDate
	private Date createdAt;
}
