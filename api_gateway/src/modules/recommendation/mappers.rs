use chrono::{DateTime, Utc};
use prost_types::Timestamp as ProstTimestamp;

use crate::{
    modules::recommendation::dtos::response::{
        cpu::CpuDto, gpu::GpuDto, mother_board::MotherBoardDto, pc::Pc,
        power_source::PowerSourceDto, ram_memmory::RamMemoryDto, ssd::SsdDto,
    },
    recommendation_grpc,
};

/// Converte um timestamp nativo do gRPC/Prost para o formato de data/hora do `chrono`.
fn from_prost_timestamp(ts: ProstTimestamp) -> DateTime<Utc> {
    DateTime::from_timestamp(ts.seconds, ts.nanos.max(0) as u32).unwrap_or_default()
}

impl From<recommendation_grpc::Cpu> for CpuDto {
    /// Converte um modelo de CPU do gRPC em um `CpuDto`.
    fn from(cpu: recommendation_grpc::Cpu) -> Self {
        Self::new(
            cpu.id,
            cpu.brand,
            cpu.r#gen,
            cpu.family,
            cpu.series,
            cpu.cores,
            cpu.threads,
            cpu.base_clock,
            cpu.max_clock,
            cpu.cache,
            cpu.socket,
            cpu.graphics,
            cpu.oc,
            cpu.recommended_power,
            cpu.avg_price,
            cpu.release_date
                .map(from_prost_timestamp)
                .unwrap_or_default(),
            cpu.img,
            cpu.created_at.map(from_prost_timestamp).unwrap_or_default(),
            cpu.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<recommendation_grpc::Gpu> for GpuDto {
    /// Converte um modelo de GPU do gRPC em um `GpuDto`.
    fn from(gpu: recommendation_grpc::Gpu) -> Self {
        Self::new(
            gpu.id,
            gpu.brand,
            gpu.family,
            gpu.series,
            gpu.memory_amount,
            gpu.memory_gen,
            gpu.cores,
            gpu.pci_express,
            gpu.recommended_power,
            gpu.avg_price,
            gpu.release_date
                .map(from_prost_timestamp)
                .unwrap_or_default(),
            gpu.img,
            gpu.created_at.map(from_prost_timestamp).unwrap_or_default(),
            gpu.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<recommendation_grpc::RamMemory> for RamMemoryDto {
    /// Converte um modelo de Memória RAM do gRPC em um `RamMemoryDto`.
    fn from(ram: recommendation_grpc::RamMemory) -> Self {
        Self::new(
            ram.id,
            ram.brand,
            ram.ddr,
            ram.memory_amount,
            ram.avg_price,
            ram.frequency_mhz,
            ram.series,
            ram.img,
            ram.created_at.map(from_prost_timestamp).unwrap_or_default(),
            ram.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<recommendation_grpc::MotherBoard> for MotherBoardDto {
    /// Converte um modelo de Placa-Mãe do gRPC em um `MotherBoardDto`.
    fn from(mb: recommendation_grpc::MotherBoard) -> Self {
        Self::new(
            mb.id,
            mb.brand,
            mb.series,
            mb.socket,
            mb.ddr,
            mb.memory_slots,
            mb.max_ram,
            mb.max_ram_frequency_mhz,
            mb.m2_slots,
            mb.pci_express_x16,
            mb.vrm,
            mb.avg_price,
            mb.score,
            mb.img,
            mb.created_at.map(from_prost_timestamp).unwrap_or_default(),
            mb.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<recommendation_grpc::PowerSource> for PowerSourceDto {
    /// Converte um modelo de Fonte de Alimentação do gRPC em um `PowerSourceDto`.
    fn from(psu: recommendation_grpc::PowerSource) -> Self {
        Self::new(
            psu.id,
            psu.brand,
            psu.series,
            psu.power_amount,
            psu.ranking,
            psu.score,
            psu.eighty_plus_cert,
            psu.avg_price,
            psu.img,
            psu.created_at.map(from_prost_timestamp).unwrap_or_default(),
            psu.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<recommendation_grpc::Ssd> for SsdDto {
    /// Converte um modelo de SSD do gRPC em um `SsdDto`.
    fn from(ssd: recommendation_grpc::Ssd) -> Self {
        Self::new(
            ssd.id,
            ssd.brand,
            ssd.series,
            ssd.amount,
            ssd.r#type,
            ssd.reading,
            ssd.writing,
            ssd.avg_price,
            ssd.score,
            ssd.img,
            ssd.created_at.map(from_prost_timestamp).unwrap_or_default(),
            ssd.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<recommendation_grpc::Pc> for Pc {
    /// Converte um modelo de PC consolidado do gRPC para a estrutura de domínio `Pc`.
    fn from(grpc_pc: recommendation_grpc::Pc) -> Self {
        Self::new(
            grpc_pc.cpu.unwrap_or_default().into(),
            grpc_pc.gpu.unwrap_or_default().into(),
            grpc_pc.ram.unwrap_or_default().into(),
            grpc_pc.mother_board.unwrap_or_default().into(),
            grpc_pc.psu.unwrap_or_default().into(),
            grpc_pc.ssd.unwrap_or_default().into(),
        )
    }
}

impl From<recommendation_grpc::BuildPcResponse> for Vec<Pc> {
    /// Converte a resposta estruturada do gRPC em um vetor de computadores recomendados.
    fn from(build_pc_response: recommendation_grpc::BuildPcResponse) -> Vec<Pc> {
        build_pc_response.pc.into_iter().map(Pc::from).collect()
    }
}
