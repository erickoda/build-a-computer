package com.buildpc.benchmark_service.entities;

import com.buildpc.benchmark_service.entities.valueObjects.SSDType;
import com.google.type.DateTime;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.sql.Date;
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
	@JdbcType(PostgreSQLEnumJdbcType.class)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(name = "type", columnDefinition = "ssd_type")
	@ColumnTransformer(
			write = "LOWER(?)::ssd_type",
			read = "UPPER(type::text)"
	)
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
