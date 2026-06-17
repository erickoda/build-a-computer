package com.buildpc.benchmark_service.services;

import com.buildpc.benchmark_service.entities.RAM;
import com.buildpc.benchmark_service.exceptions.ram.DuplicatedRAMException;
import com.buildpc.benchmark_service.exceptions.ram.RAMNotFoundException;
import com.buildpc.benchmark_service.repository.RAMRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true, noRollbackFor = RAMNotFoundException.class)
@AllArgsConstructor
public class RAMService {
    private final RAMRepository ramRepository;

    public RAM saveRAM(RAM ram) throws DuplicatedRAMException {
        return ramRepository.save(ram);
    }

    public List<RAM> searchAll() throws RAMNotFoundException {
        List<RAM> rams = ramRepository.findAll();

        if(rams.isEmpty())
            throw new RAMNotFoundException("None RAM Memory was find");

        return rams;
    }
}
