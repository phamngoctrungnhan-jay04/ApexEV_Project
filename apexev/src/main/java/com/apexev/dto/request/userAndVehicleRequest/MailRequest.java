package com.apexev.dto.request.userAndVehicleRequest;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Thông tin yêu cầu gửi mail")
public class MailRequest {

    @Schema(description = "Địa chỉ email người nhận", required = true)
    private String to;

    @Schema(description = "Tiêu đề email", required = true)
    private String subject;

    @Schema(description = "Nội dung email", required = true)
    private String body;
//
//    @Schema(description = "Đính kèm tệp",required = false)
//    private MultipartFile[] file;

}
