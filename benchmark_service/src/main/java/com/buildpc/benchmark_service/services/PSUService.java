package com.buildpc.benchmark_service.services;

import com.buildpc.benchmark_service.entities.PSU;
import com.buildpc.benchmark_service.exceptions.psu.DuplicatedPSUException;
import com.buildpc.benchmark_service.exceptions.psu.PSUNotFoundException;
import com.buildpc.benchmark_service.repository.PSURepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@AllArgsConstructor
public class PSUService {
    private final PSURepository psuRepository;

    public PSU savePSU(PSU psu) throws DuplicatedPSUException {
        if(psuRepository.existsByBrandAndSeries(psu.getBrand(), psu.getSeries()))
            throw new DuplicatedPSUException("This PSU already exists");

        return psuRepository.save(psu);
    }

    public List<PSU> searchAll() throws PSUNotFoundException{
        List<PSU> powerSourcesSupply = psuRepository.findAll();

        if(powerSourcesSupply.isEmpty())
            throw new PSUNotFoundException("None PSU was found");

        return powerSourcesSupply;
    }

    public void deleteById(UUID id) {
        if(!psuRepository.existsById(id))
            throw new PSUNotFoundException("Can't find this PSU in data base");

        psuRepository.deleteById(id);
    }
}
