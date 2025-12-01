package com.apexev.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuotationResponse {
    
    private Long serviceOrderId;
    
    private Long customerId;
    
    private String customerName;
    
    private String customerEmail;
    
    private String vehicleLicensePlate;
    
    private String vehicleModel;
    
    private List<QuotationItemResponse> items;
    
    private Double subtotal;
    
    private Double tax;
    
    private Double totalAmount;
    
    private String additionalNotes;
    
    private LocalDateTime quotationDate;
    
    private Boolean sentToCustomer;
    
    private LocalDateTime sentAt;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotationItemResponse {
        private Long itemId;
        private String itemType;
        private String itemName;
        private String itemDescription;
        private Integer quantity;
        private Double unitPrice;
        private Double lineTotal;
        private String status;
    }
}
