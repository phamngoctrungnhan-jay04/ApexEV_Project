package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SendQuotationRequest {
    
    @NotEmpty(message = "Quotation items cannot be empty")
    private List<QuotationItemRequest> items;
    
    private String additionalNotes;
    
    @Getter
    @Setter
    public static class QuotationItemRequest {
        private String itemType; // "SERVICE" or "PART"
        private Long itemRefId;
        private String itemName;
        private String itemDescription;
        private Integer quantity;
        private Double unitPrice;
    }
}
