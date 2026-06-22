package com.buildpc.benchmark_microservice.services;

import com.buildpc.benchmark_microservice.entities.MotherBoard;
import com.buildpc.benchmark_microservice.exceptions.motherBoard.DuplicatedMotherBoardException;
import com.buildpc.benchmark_microservice.exceptions.motherBoard.MotherBoardNotFoundException;
import com.buildpc.benchmark_microservice.repository.MotherBoardRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true, noRollbackFor = MotherBoardNotFoundException.class)
@AllArgsConstructor
public class MotherBoardService {
    private final MotherBoardRepository motherBoardRepository;

    public MotherBoard save(MotherBoard mb) throws DuplicatedMotherBoardException {

        if(motherBoardRepository.existsByBrandAndSeriesAndSocketAndDdr(
                mb.getBrand(),
                mb.getSeries(),
                mb.getSocket(),
                mb.getDdr()
            )
        ){
            throw new DuplicatedMotherBoardException("This Mother Board already exists");
        }

        return motherBoardRepository.save(mb);
    }

    public List<MotherBoard> searchAll() throws MotherBoardNotFoundException{
        List<MotherBoard> motherBoards = motherBoardRepository.findAll();

        if(motherBoards.isEmpty())
            throw new MotherBoardNotFoundException("None mother board was found");

        return motherBoards;
    }

    public MotherBoard update(UUID id, MotherBoard mb) throws MotherBoardNotFoundException {
        MotherBoard existing = motherBoardRepository.findById(id)
                .orElseThrow(() -> new MotherBoardNotFoundException("Can't find this Mother Board in data base"));

        existing.setBrand(mb.getBrand());
        existing.setSeries(mb.getSeries());
        existing.setSocket(mb.getSocket());
        existing.setDdr(mb.getDdr());
        existing.setMemorySlots(mb.getMemorySlots());
        existing.setMaxRAM(mb.getMaxRAM());
        existing.setMaxRamMemoryFrequencyMhz(mb.getMaxRamMemoryFrequencyMhz());
        existing.setM2Slots(mb.getM2Slots());
        existing.setPciExpress(mb.getPciExpress());
        existing.setVrm(mb.getVrm());
        existing.setAvgPrice(mb.getAvgPrice());
        existing.setScore(mb.getScore());
        existing.setImg(mb.getImg());

        return motherBoardRepository.save(existing);
    }

    public void deleteById(UUID id) throws MotherBoardNotFoundException{
        if(!motherBoardRepository.existsById(id))
            throw new MotherBoardNotFoundException("Can't find this Mother Board in data base");

        motherBoardRepository.deleteById(id);
    }
}
