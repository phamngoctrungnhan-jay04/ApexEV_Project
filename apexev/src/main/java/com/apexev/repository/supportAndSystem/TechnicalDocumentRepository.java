// TechnicalDocumentRepository.java
package com.apexev.repository.supportAndSystem;

import com.apexev.entity.TechnicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicalDocumentRepository extends JpaRepository<TechnicalDocument, Long> {
    // Dùng cho KTV tìm kiếm
    List<TechnicalDocument> findByCategory(String category);
    List<TechnicalDocument> findByTitleContainingIgnoreCase(String titleKeyword);
}