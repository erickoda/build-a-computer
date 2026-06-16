package com.buildpc.benchmark_service.services;


import com.buildpc.benchmark_service.entities.GPU;
import com.buildpc.benchmark_service.exceptions.gpu.DuplicatedGPUException;
import com.buildpc.benchmark_service.exceptions.gpu.GPUNotFoundException;
import com.buildpc.benchmark_service.repository.GPURepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true, noRollbackFor = GPUNotFoundException.class)
@AllArgsConstructor
public class GPUService {
    private final GPURepository gpuRepository;

    public GPU saveGPU(GPU gpu) throws DuplicatedGPUException {
        if(gpuRepository.existsBySeries(gpu.getSeries())) {
            throw new DuplicatedGPUException("this CPU already exists");
        }
        return gpuRepository.save(gpu);
    }
}
