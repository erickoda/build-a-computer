package com.buildpc.benchmark_service.services;

import com.buildpc.benchmark_service.entities.CPU;
import com.buildpc.benchmark_service.exceptions.CPUNotFoundException;
import com.buildpc.benchmark_service.exceptions.DuplicatedCPUException;
import com.buildpc.benchmark_service.repository.CPURepository;
import com.buildpc.benchmark_service.repository.specs.CPUSpecs;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@AllArgsConstructor
public class CPUService {
    private final CPURepository cpuRepository;

    public CPU saveCPU(CPU cpu) throws DuplicatedCPUException {
        if(cpuRepository.existsBySeries(cpu.getSeries())) {
            throw new DuplicatedCPUException("this cpu already exists");
        }
        return cpuRepository.save(cpu);
    }

    public void deleteById(UUID id) { cpuRepository.deleteById(id); }

    public List<CPU> searchByTokens(String searchString) {
        Specification<CPU> specs = CPUSpecs.specificationsLikeTokens(searchString);

        List<CPU> cpus = cpuRepository.findAll(specs);

        if(cpus.isEmpty()) {
            throw new CPUNotFoundException("None cpu was find");
        }

        return cpus;
    }
}
