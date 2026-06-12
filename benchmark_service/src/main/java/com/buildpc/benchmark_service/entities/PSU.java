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
	private Date updatedAt;
	private Date createdAt;
}
