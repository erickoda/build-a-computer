package com.buildpc.benchmark_service.services;

import com.buildpc.benchmark_service.entities.Storage;
import com.buildpc.benchmark_service.exceptions.storage.DuplicatedStorageException;
import com.buildpc.benchmark_service.exceptions.storage.StorageNotFoundException;
import com.buildpc.benchmark_service.repository.StorageRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true, noRollbackFor = StorageNotFoundException.class)
@AllArgsConstructor
public class StorageService {
    private StorageRepository storageRepository;

    public Storage saveStorage(Storage ssd) {
        if(storageRepository.existsByBrandAndSeriesAndAmount(ssd.getBrand(), ssd.getSeries(), ssd.getAmount()))
            throw new DuplicatedStorageException("This Storage already exists");

        return storageRepository.save(ssd);
    }

    public void deleteById(UUID id) {
        if(!storageRepository.existsById(id))
            throw new StorageNotFoundException("Can't find this ssd in data base");

        storageRepository.deleteById(id);
    }

    public List<Storage> searchAll() {
        List<Storage> storages = storageRepository.findAll();

        if(storages.isEmpty())
            throw new StorageNotFoundException("None storage was found");

        return storages;
    }
}
