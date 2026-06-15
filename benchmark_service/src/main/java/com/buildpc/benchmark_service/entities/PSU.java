package com.buildpc.benchmark_service.entities;

import com.google.type.DateTime;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.sql.Date;
import java.util.UUID;

@Entity
@Table(name = "power_sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PSU {
	public enum PowerSourceRanking {
		WHITE,
		BRONZE,
		SILVER,
		GOLD,
		PLATINUM,
		TITANIUM
	}

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private String series;
	private Integer powerAmount;
	private PowerSourceRanking ranking;
	private Boolean certification;
	private Float averagePrice;
	private Integer score;
	private byte[] image;

	@LastModifiedDate
	private Date updatedAt;

	@CreatedDate
	private Date createdAt;
}
