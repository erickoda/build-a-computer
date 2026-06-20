package com.buildpc.benchmark_service.entities;

import com.buildpc.benchmark_service.entities.valueObjects.PSURankingUserType;
import com.buildpc.benchmark_service.entities.valueObjects.Performance;
import com.buildpc.benchmark_service.entities.valueObjects.PerformanceUserType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "benchmarks")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Benchmark {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String title;
	private Integer resolution;

	@Type(PerformanceUserType.class)
	@Column(name = "graphics_quality", columnDefinition = "performance")
	private Performance graphicsQuality;

	@NonNull
	@ManyToOne
	@JoinColumn(name = "cpu_id")
	private CPU cpu;

	@ManyToOne
	@JoinColumn(name = "gpu_id")
	private GPU gpu;

	@ManyToOne
	@JoinColumn(name = "ram_id")
	private RAM ram;

	@Column(name = "avg_fps")
	private Integer avgFPS;

	@Column(name = "max_fps")
	private Integer maxFPS;

	@Column(name = "min_fps")
	private Integer minFPS;

	@ManyToOne
	@JoinColumn(name = "game_id")
	private Game game;

	@Column(name = "user_id")
	private UUID userId;

	private Integer score;

	@CreatedDate
	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@LastModifiedDate
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
}
