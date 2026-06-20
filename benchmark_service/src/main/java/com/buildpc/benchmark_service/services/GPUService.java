package com.buildpc.benchmark_service.services;


import com.buildpc.benchmark_service.entities.GPU;
import com.buildpc.benchmark_service.exceptions.gpu.DuplicatedGPUException;
import com.buildpc.benchmark_service.exceptions.gpu.GPUNotFoundException;
import com.buildpc.benchmark_service.repository.GPURepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    public GPU searchBYId(UUID id) throws GPUNotFoundException {
        Optional<GPU> foundGPU = gpuRepository.findById(id);

        return foundGPU.orElseThrow(() -> new GPUNotFoundException("Can't find this GPU in data base"));
    }

    public List<GPU> searchAll() throws GPUNotFoundException{
        List<GPU> gpus = gpuRepository.findAll();

        if(gpus.isEmpty())
            throw new GPUNotFoundException("None GPU was found");

        return gpus;
    }

    public void deleteById(UUID id) throws GPUNotFoundException {
        if(!gpuRepository.existsById(id))
            throw new GPUNotFoundException("Can't find this GPU in data base");

        gpuRepository.deleteById(id);
    }
}
