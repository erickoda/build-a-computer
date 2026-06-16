package com.buildpc.benchmark_service.repository.specs;

import com.buildpc.benchmark_service.entities.CPU;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class CPUSpecs {

    public static Specification<CPU> specificationsLikeTokens(String searchString) {
        return (root, query, cb) -> {
            if (searchString == null || searchString.isBlank()) {
                return cb.conjunction();
            }

            String[] tokens = searchString.trim().split("\\s+");
            List<Predicate> tokenPredicates = new ArrayList<>();

            for(String token: tokens) {
                String tokenLower = token.toLowerCase();

                Predicate brandPred = cb.like(
                        cb.lower(cb.coalesce(root.get("brand"), "")),
                        "%" + tokenLower + "%"
                );

                Predicate genPred = cb.like(
                        cb.lower(cb.coalesce(root.get("gen"), "")),
                        "%" + tokenLower + "%"
                );

                Predicate familyPred = cb.like(
                        cb.lower(cb.coalesce(root.get("family"), "")),
                        "%" + tokenLower + "%"
                );

                Predicate seriesPred = cb.like(
                        cb.lower(cb.coalesce(root.get("series"), "")),
                        "%" + tokenLower + "%"
                );

                tokenPredicates.add(cb.or(brandPred, genPred, familyPred, seriesPred));
            }

            return cb.and(tokenPredicates.toArray(Predicate[]::new));
        };
    }
}
