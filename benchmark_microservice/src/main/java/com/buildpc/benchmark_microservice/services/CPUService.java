package com.buildpc.benchmark_microservice.services;

import com.buildpc.benchmark_microservice.entities.CPU;
import com.buildpc.benchmark_microservice.exceptions.cpu.CPUNotFoundException;
import com.buildpc.benchmark_microservice.exceptions.cpu.DuplicatedCPUException;
import com.buildpc.benchmark_microservice.repository.CPURepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true, noRollbackFor = CPUNotFoundException.class)
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

    public CPU updateCPU(UUID id, CPU cpu) throws CPUNotFoundException {
        CPU existing = cpuRepository.findById(id)
                .orElseThrow(() -> new CPUNotFoundException("Can't find this CPU"));

        existing.setBrand(cpu.getBrand());
        existing.setGen(cpu.getGen());
        existing.setFamily(cpu.getFamily());
        existing.setSeries(cpu.getSeries());
        existing.setCores(cpu.getCores());
        existing.setThreads(cpu.getThreads());
        existing.setBaseClock(cpu.getBaseClock());
        existing.setMaxClock(cpu.getMaxClock());
        existing.setCache(cpu.getCache());
        existing.setSocket(cpu.getSocket());
        existing.setGraphics(cpu.getGraphics());
        existing.setOc(cpu.getOc());
        existing.setRecommendedPower(cpu.getRecommendedPower());
        existing.setAvgPrice(cpu.getAvgPrice());
        existing.setReleaseDate(cpu.getReleaseDate());
        existing.setImg(cpu.getImg());

        return cpuRepository.save(existing);
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
