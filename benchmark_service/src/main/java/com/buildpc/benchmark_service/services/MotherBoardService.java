package com.buildpc.benchmark_service.services;

import com.buildpc.benchmark_service.entities.MotherBoard;
import com.buildpc.benchmark_service.exceptions.motherBoard.DuplicatedMotherBoardException;
import com.buildpc.benchmark_service.exceptions.motherBoard.MotherBoardNotFoundException;
import com.buildpc.benchmark_service.repository.MotherBoardRepository;
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

    public void deleteById(UUID id) throws MotherBoardNotFoundException{
        if(!motherBoardRepository.existsById(id))
            throw new MotherBoardNotFoundException("Can't find this Mother Board in data base");

        motherBoardRepository.deleteById(id);
    }
}
