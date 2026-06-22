package com.buildpc.benchmark_microservice.services;


import com.buildpc.benchmark_microservice.entities.GPU;
import com.buildpc.benchmark_microservice.exceptions.gpu.DuplicatedGPUException;
import com.buildpc.benchmark_microservice.exceptions.gpu.GPUNotFoundException;
import com.buildpc.benchmark_microservice.repository.GPURepository;
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

    public GPU updateGPU(UUID id, GPU gpu) throws GPUNotFoundException {
        GPU existing = gpuRepository.findById(id)
                .orElseThrow(() -> new GPUNotFoundException("Can't find this GPU in data base"));

        existing.setBrand(gpu.getBrand());
        existing.setFamily(gpu.getFamily());
        existing.setSeries(gpu.getSeries());
        existing.setMemoryAmount(gpu.getMemoryAmount());
        existing.setMemoryGen(gpu.getMemoryGen());
        existing.setCores(gpu.getCores());
        existing.setPciExpress(gpu.getPciExpress());
        existing.setRecommendedPower(gpu.getRecommendedPower());
        existing.setAvgPrice(gpu.getAvgPrice());
        existing.setReleaseDate(gpu.getReleaseDate());
        existing.setImg(gpu.getImg());

        return gpuRepository.save(existing);
    }

    public void deleteById(UUID id) throws GPUNotFoundException {
        if(!gpuRepository.existsById(id))
            throw new GPUNotFoundException("Can't find this GPU in data base");

        gpuRepository.deleteById(id);
    }
}
