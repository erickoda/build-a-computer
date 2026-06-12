package com.buildpc.benchmark_service.entities;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Benchmark {
	public enum GraphicsQuality {
		LOW,
		MEDIUM,
		HIGH,
		ULTRA
	}

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String title;
	private Integer resolution;
	private GraphicsQuality graphicsQuality;
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

	private Integer averageFPS;
	private Integer minimumFPS;
	private Integer maximumFPS;

	@ManyToOne
	@JoinColumn(name = "game_id")
	private Game game;

	private UUID userId;
	private Float score;
	private Date updatedAt;
	private Date createdAt;
}
