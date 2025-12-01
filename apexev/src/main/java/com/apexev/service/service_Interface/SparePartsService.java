package com.apexev.service.service_Interface;

import com.apexev.dto.request.coreBussinessRequest.AdjustInventoryRequest;
import com.apexev.dto.request.coreBussinessRequest.CheckInventoryRequest;
import com.apexev.dto.request.coreBussinessRequest.CreatePartRequest;
import com.apexev.dto.request.coreBussinessRequest.UpdatePartRequest;
import com.apexev.dto.response.coreBussinessResponse.InventoryCheckResponse;
import com.apexev.dto.response.coreBussinessResponse.PartResponse;
import com.apexev.enums.PartStatus;

import java.util.List;

public interface SparePartsService {
    
    /**
     * Create a new spare part
     * @param request DTO containing part details
     * @return Created part response
     */
    PartResponse createPart(CreatePartRequest request);
    
    /**
     * Get a specific spare part by ID
     * @param partId ID of the part
     * @return Part details
     */
    PartResponse getPartById(Long partId);
    
    /**
     * Get a spare part by SKU code
     * @param sku SKU code of the part
     * @return Part details
     */
    PartResponse getPartBySku(String sku);
    
    /**
     * Get all spare parts (paginated or filtered)
     * @return List of all parts
     */
    List<PartResponse> getAllParts();
    
    /**
     * Get all active spare parts
     * @return List of active parts
     */
    List<PartResponse> getActiveParts();
    
    /**
     * Update an existing spare part
     * @param partId ID of the part to update
     * @param request DTO containing updated part details
     * @return Updated part response
     */
    PartResponse updatePart(Long partId, UpdatePartRequest request);
    
    /**
     * Delete a spare part (soft delete or hard delete based on business logic)
     * @param partId ID of the part to delete
     */
    void deletePart(Long partId);
    
    /**
     * Change the status of a spare part
     * @param partId ID of the part
     * @param status New status
     * @return Updated part response
     */
    PartResponse changePartStatus(Long partId, PartStatus status);
    
    /**
     * Adjust inventory quantity for a part
     * @param partId ID of the part
     * @param request DTO containing adjustment details
     * @return Updated part response
     */
    PartResponse adjustInventory(Long partId, AdjustInventoryRequest request);
    
    /**
     * Check if sufficient inventory is available for a part
     * @param request DTO containing part ID and required quantity
     * @return Inventory check response with availability status
     */
    InventoryCheckResponse checkInventory(CheckInventoryRequest request);
    
    /**
     * Check inventory for multiple parts (batch operation)
     * @param requests List of inventory check requests
     * @return List of inventory check responses
     */
    List<InventoryCheckResponse> checkInventoryBatch(List<CheckInventoryRequest> requests);
    
    /**
     * Get all low-stock parts (below specified threshold)
     * @param threshold Quantity threshold
     * @return List of low-stock parts
     */
    List<PartResponse> getLowStockParts(Integer threshold);
    
    /**
     * Get all out-of-stock parts
     * @return List of out-of-stock parts
     */
    List<PartResponse> getOutOfStockParts();
    
    /**
     * Search parts by name (partial match, case-insensitive)
     * @param partName Part name or partial name
     * @return List of matching parts
     */
    List<PartResponse> searchPartsByName(String partName);
    
    /**
     * Search parts by SKU code (partial match, case-insensitive)
     * @param sku SKU code or partial code
     * @return List of matching parts
     */
    List<PartResponse> searchPartsBySku(String sku);
    
    /**
     * Get inventory report for all parts
     * @return List of all parts for inventory reporting
     */
    List<PartResponse> getInventoryReport();

    /**
     * Use a part for a specific service order item: deduct inventory and link action to the item.
     * @param request DTO containing partId, serviceOrderItemId and quantityUsed
     * @return response including remaining stock
     */
    com.apexev.dto.response.coreBussinessResponse.UsePartResponse usePart(com.apexev.dto.request.coreBussinessRequest.UsePartRequest request);

}
