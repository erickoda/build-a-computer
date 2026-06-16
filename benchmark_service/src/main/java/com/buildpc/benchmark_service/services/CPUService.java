package com.buildpc.benchmark_service.services;

import com.buildpc.benchmark_service.entities.CPU;
import com.buildpc.benchmark_service.exceptions.cpu.CPUNotFoundException;
import com.buildpc.benchmark_service.exceptions.cpu.DuplicatedCPUException;
import com.buildpc.benchmark_service.repository.CPURepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
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

    public CPU searchById(UUID id) throws CPUNotFoundException {
        Optional<CPU> foundCPU = cpuRepository.findById(id);

        return foundCPU.orElseThrow(() -> new CPUNotFoundException("Can't find this CPU"));
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
            throw new CPUNotFoundException("None CPU was found");
        }

        return cpus;
    }
}
