package com.apexev.repository.coreBussiness;

import com.apexev.entity.Part;
import com.apexev.enums.PartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    Optional<Part> findBySku(String sku);
    
    // Find all parts with specific status
    List<Part> findByStatus(PartStatus status);
    
    // Find low stock parts (quantity below threshold)
    @Query("SELECT p FROM Part p WHERE p.quantityInStock < :threshold AND p.status = 'ACTIVE'")
    List<Part> findLowStockParts(@Param("threshold") Integer threshold);
    
    // Find parts by name (case-insensitive, partial match)
    @Query("SELECT p FROM Part p WHERE LOWER(p.partName) LIKE LOWER(CONCAT('%', :partName, '%'))")
    List<Part> findByPartNameContainingIgnoreCase(@Param("partName") String partName);
    
    // Find parts by SKU (case-insensitive, partial match)
    @Query("SELECT p FROM Part p WHERE LOWER(p.sku) LIKE LOWER(CONCAT('%', :sku, '%'))")
    List<Part> findBySkuContainingIgnoreCase(@Param("sku") String sku);
    
    // Find all active parts ordered by name
    List<Part> findByStatusOrderByPartNameAsc(PartStatus status);
    
    // Check if SKU exists (excluding specific part ID for updates)
    @Query("SELECT COUNT(p) > 0 FROM Part p WHERE LOWER(p.sku) = LOWER(:sku) AND p.id != :partId")
    boolean existsSkuExcluding(@Param("sku") String sku, @Param("partId") Long partId);
    
    // Find parts out of stock
    @Query("SELECT p FROM Part p WHERE p.quantityInStock = 0 AND p.status != 'DISCONTINUED'")
    List<Part> findOutOfStockParts();
    
    // Find all parts for inventory report
    @Query("SELECT p FROM Part p WHERE p.status IN ('ACTIVE', 'INACTIVE') ORDER BY p.partName")
    List<Part> findForInventoryReport();
}
