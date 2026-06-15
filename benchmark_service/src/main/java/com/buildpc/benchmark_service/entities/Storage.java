package com.buildpc.benchmark_service.entities;

import com.google.type.DateTime;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.sql.Date;
import java.util.UUID;

@Entity
@Table(name = "ssds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Storage {
	public enum SSDType {
		SATA,
		M2_SATA,
		M2_NVME
	}

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String brand;
	private String series;
	private Integer memoryAmount;
	private SSDType type;
	private Integer reading;
	private Integer writing;
	private Float averagePrice;
	private Integer score;
	private byte[] image;

	@LastModifiedDate
	private Date updatedAt;

	@CreatedDate
	private Date createdAt;
}
