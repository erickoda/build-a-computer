package com.buildpc.benchmark_service.entities;

import com.google.type.DateTime;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.sql.Date;
import java.util.UUID;

@Entity
@Table(name = "gpus")
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
	private Date releaseDate;
	private Float averagePrice;
	private byte[] image;

	@CreatedDate
	private Date createdAt;

	@LastModifiedDate
	private Date updatedAt;
}
