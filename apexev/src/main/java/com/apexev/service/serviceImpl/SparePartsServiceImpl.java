package com.apexev.service.serviceImpl;

import com.apexev.dto.request.coreBussinessRequest.AdjustInventoryRequest;
import com.apexev.dto.request.coreBussinessRequest.CheckInventoryRequest;
import com.apexev.dto.request.coreBussinessRequest.CreatePartRequest;
import com.apexev.dto.request.coreBussinessRequest.UpdatePartRequest;
import com.apexev.dto.response.coreBussinessResponse.InventoryCheckResponse;
import com.apexev.dto.response.coreBussinessResponse.PartResponse;
import com.apexev.entity.Part;
import com.apexev.entity.ServiceOrderItem;
import com.apexev.enums.PartStatus;
import com.apexev.exception.DuplicatePartException;
import com.apexev.exception.InsufficientInventoryException;
import com.apexev.exception.PartNotFoundException;
import com.apexev.repository.coreBussiness.PartRepository;
import com.apexev.repository.coreBussiness.ServiceOrderItemRepository;
import com.apexev.service.service_Interface.SparePartsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SparePartsServiceImpl implements SparePartsService {
    
    private final PartRepository partRepository;
    private final ModelMapper modelMapper;
    private final ServiceOrderItemRepository serviceOrderItemRepository;
    
    @Override
    public PartResponse createPart(CreatePartRequest request) {
        // Validate SKU uniqueness
        if (partRepository.findBySku(request.getSku()).isPresent()) {
            throw new DuplicatePartException("Mã SKU '" + request.getSku() + "' đã tồn tại trong hệ thống");
        }
        
        Part part = new Part();
        part.setPartName(request.getPartName());
        part.setSku(request.getSku());
        part.setDescription(request.getDescription());
        part.setQuantityInStock(request.getQuantityInStock());
        part.setPrice(request.getPrice());
        part.setStatus(PartStatus.ACTIVE);
        
        Part savedPart = partRepository.save(part);
        return mapToResponse(savedPart);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PartResponse getPartById(Long partId) {
        Part part = findPartOrThrow(partId);
        return mapToResponse(part);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PartResponse getPartBySku(String sku) {
        Part part = partRepository.findBySku(sku)
                .orElseThrow(() -> new PartNotFoundException("Không tìm thấy phụ tùng với mã SKU: " + sku));
        return mapToResponse(part);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartResponse> getAllParts() {
        return partRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartResponse> getActiveParts() {
        return partRepository.findByStatusOrderByPartNameAsc(PartStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public PartResponse updatePart(Long partId, UpdatePartRequest request) {
        Part part = findPartOrThrow(partId);
        
        // If SKU is being updated, validate uniqueness
        if (request.getPartName() != null && !request.getPartName().isBlank()) {
            part.setPartName(request.getPartName());
        }
        
        if (request.getDescription() != null) {
            part.setDescription(request.getDescription());
        }
        
        if (request.getQuantityInStock() != null) {
            part.setQuantityInStock(request.getQuantityInStock());
        }
        
        if (request.getPrice() != null) {
            part.setPrice(request.getPrice());
        }
        
        Part updatedPart = partRepository.save(part);
        return mapToResponse(updatedPart);
    }
    
    @Override
    public void deletePart(Long partId) {
        Part part = findPartOrThrow(partId);
        // Soft delete by changing status to DISCONTINUED
        part.setStatus(PartStatus.DISCONTINUED);
        partRepository.save(part);
    }
    
    @Override
    public PartResponse changePartStatus(Long partId, PartStatus status) {
        Part part = findPartOrThrow(partId);
        part.setStatus(status);
        Part updatedPart = partRepository.save(part);
        return mapToResponse(updatedPart);
    }
    
    @Override
    public PartResponse adjustInventory(Long partId, AdjustInventoryRequest request) {
        Part part = findPartOrThrow(partId);
        
        int newQuantity = part.getQuantityInStock() + request.getQuantityAdjustment();
        
        // Ensure quantity doesn't go negative
        if (newQuantity < 0) {
            throw new IllegalArgumentException(
                    "Số lượng tồn kho không thể âm. Hiện tại: " + part.getQuantityInStock() + 
                    ", điều chỉnh: " + request.getQuantityAdjustment()
            );
        }
        
        part.setQuantityInStock(newQuantity);
        
        // Update status if inventory becomes zero
        if (newQuantity == 0 && part.getStatus() != PartStatus.DISCONTINUED) {
            part.setStatus(PartStatus.OUT_OF_STOCK);
        } else if (newQuantity > 0 && part.getStatus() == PartStatus.OUT_OF_STOCK) {
            part.setStatus(PartStatus.ACTIVE);
        }
        
        Part updatedPart = partRepository.save(part);
        return mapToResponse(updatedPart);
    }

    @Override
    public com.apexev.dto.response.coreBussinessResponse.UsePartResponse usePart(com.apexev.dto.request.coreBussinessRequest.UsePartRequest request) {
        Part part = findPartOrThrow(request.getPartId());

        ServiceOrderItem item = serviceOrderItemRepository.findById(request.getServiceOrderItemId())
                .orElseThrow(() -> new RuntimeException("ServiceOrderItem not found: " + request.getServiceOrderItemId()));

        int qty = request.getQuantityUsed();
        if (qty <= 0) {
            throw new IllegalArgumentException("Số lượng sử dụng phải lớn hơn 0");
        }

        if (part.getQuantityInStock() < qty) {
            throw new InsufficientInventoryException("Không đủ tồn kho cho phụ tùng " + part.getSku());
        }

        part.setQuantityInStock(part.getQuantityInStock() - qty);

        if (part.getQuantityInStock() == 0 && part.getStatus() != PartStatus.DISCONTINUED) {
            part.setStatus(PartStatus.OUT_OF_STOCK);
        }

        Part saved = partRepository.save(part);

        return new com.apexev.dto.response.coreBussinessResponse.UsePartResponse(
                saved.getId(),
                item.getId(),
                qty,
                saved.getQuantityInStock(),
                "Phụ tùng đã được sử dụng và trừ kho thành công"
        );
    }
    
    @Override
    @Transactional(readOnly = true)
    public InventoryCheckResponse checkInventory(CheckInventoryRequest request) {
        Part part = findPartOrThrow(request.getPartId());
        
        boolean available = part.getQuantityInStock() >= request.getRequiredQuantity();
        Integer insufficientBy = available ? null : 
                (request.getRequiredQuantity() - part.getQuantityInStock());
        
        return new InventoryCheckResponse(
                part.getId(),
                part.getPartName(),
                part.getSku(),
                part.getQuantityInStock(),
                request.getRequiredQuantity(),
                available,
                insufficientBy
        );
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<InventoryCheckResponse> checkInventoryBatch(List<CheckInventoryRequest> requests) {
        return requests.stream()
                .map(this::checkInventory)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartResponse> getLowStockParts(Integer threshold) {
        return partRepository.findLowStockParts(threshold).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartResponse> getOutOfStockParts() {
        return partRepository.findOutOfStockParts().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartResponse> searchPartsByName(String partName) {
        return partRepository.findByPartNameContainingIgnoreCase(partName).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartResponse> searchPartsBySku(String sku) {
        return partRepository.findBySkuContainingIgnoreCase(sku).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartResponse> getInventoryReport() {
        return partRepository.findForInventoryReport().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    // ========== Helper Methods ==========
    
    private Part findPartOrThrow(Long partId) {
        return partRepository.findById(partId)
                .orElseThrow(() -> new PartNotFoundException("Không tìm thấy phụ tùng với ID: " + partId));
    }
    
    private PartResponse mapToResponse(Part part) {
        PartResponse response = modelMapper.map(part, PartResponse.class);
        response.setInStock(part.getQuantityInStock() > 0);
        return response;
    }
}
