package com.buildpc.benchmark_service.entities;

import com.buildpc.benchmark_service.entities.valueObjects.PSURanking;
import com.buildpc.benchmark_service.entities.valueObjects.PSURankingUserType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "power_sources")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PSU {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private String series;
	private Integer powerAmount;

	// TODO: set column name equal pc-builder service
	@Type(PSURankingUserType.class)
	@Column(name = "ranking", columnDefinition = "psu_ranking")
	private PSURanking ranking;

	private Boolean eightyPlusCert;
	private Float avgPrice;
	private Integer score;
	private byte[] img;

	@LastModifiedDate
	private LocalDateTime updatedAt;

	@CreatedDate
	private LocalDateTime createdAt;
}
