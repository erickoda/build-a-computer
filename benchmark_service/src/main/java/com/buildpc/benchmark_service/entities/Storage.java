package com.buildpc.benchmark_service.entities;

import com.buildpc.benchmark_service.entities.valueObjects.PSURankingUserType;
import com.buildpc.benchmark_service.entities.valueObjects.SSDType;
import com.buildpc.benchmark_service.entities.valueObjects.SSDTypeUserType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ssds")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Storage {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private String series;
	private Integer amount;

	//TODO: set column name equal pc-builder service
	@Type(SSDTypeUserType.class)
	@Column(name = "type", columnDefinition = "ssd_type")
	private SSDType type;

	private Integer reading;
	private Integer writing;
	private Float avgPrice;
	private Integer score;
	private byte[] img;

	@LastModifiedDate
	private LocalDateTime updatedAt;

	@CreatedDate
	private LocalDateTime createdAt;
}
