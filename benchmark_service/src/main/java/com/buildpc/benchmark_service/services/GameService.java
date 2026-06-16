package com.buildpc.benchmark_service.services;

import com.buildpc.benchmark_service.entities.Game;
import com.buildpc.benchmark_service.exceptions.game.DuplicatedGameException;
import com.buildpc.benchmark_service.exceptions.game.GameNotFoundException;
import com.buildpc.benchmark_service.repository.GameRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@AllArgsConstructor
public class GameService {
    private final GameRepository gameRepository;

    public Game saveGame(Game game) throws DuplicatedGameException {
        if(gameRepository.existsByNameAndNecessaryDisk(game.getName(), game.getNecessaryDisk())){
            throw new DuplicatedGameException("This game already exists");
        }

        return gameRepository.save(game);
    }

    public List<Game> searchAll() {
        List<Game> games = gameRepository.findAll();

        if(games.isEmpty()){
            throw new GameNotFoundException("None games was found");
        }

        return games;
    }

    public void deleteById(UUID id) throws GameNotFoundException{
        if(!gameRepository.existsById(id))
            throw new GameNotFoundException("Can't find this game in data base");

        gameRepository.deleteById(id);
    }
}
