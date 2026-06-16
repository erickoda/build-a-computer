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
            throw new DuplicatedCPUException("this CPU already exists");
        }
        return cpuRepository.save(cpu);
    }

    public void deleteById(UUID id) throws CPUNotFoundException{
        if(!cpuRepository.existsById(id)) {
            throw new CPUNotFoundException("Can't find this CPU");
        }

        cpuRepository.deleteById(id);
    }

    public List<CPU> searchAll() {
        List<CPU> cpus = cpuRepository.findAll();

        if(cpus.isEmpty()) {
            throw new CPUNotFoundException("None CPU was find");
        }

        return cpus;
    }
}
