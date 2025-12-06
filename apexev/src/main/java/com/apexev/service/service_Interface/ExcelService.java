package com.apexev.service.service_Interface;

import com.apexev.dto.response.coreBussinessResponse.BulkImportResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ExcelService {
    byte[] generateFileExport() throws IOException;

    BulkImportResponse importUsersFromExcel(MultipartFile file) throws IOException;
}
