package com.buildpc.benchmark_service.entities;

import com.google.type.DateTime;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.sql.Date;
import java.util.UUID;

@Entity
@Table(name = "cpus")
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
	private Integer recommendedPower;
	private Date releaseDate;
	private Float averagePrice;
	private byte[] image;

	@CreatedDate
	private Date createdAt;

	@LastModifiedDate
	private Date updatedAt;
}
