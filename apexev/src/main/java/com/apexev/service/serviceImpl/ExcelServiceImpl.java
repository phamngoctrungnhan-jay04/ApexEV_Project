package com.apexev.service.serviceImpl;

import com.apexev.dto.response.coreBussinessResponse.BulkImportResponse;
import com.apexev.entity.User;
import com.apexev.enums.UserRole;
import com.apexev.event.user.UserRegisterEvent;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.service.service_Interface.ExcelService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelServiceImpl implements ExcelService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ApplicationEventPublisher publisher;

    public byte[] generateFileExport() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Users");

        String[] headers = {"Full Name", "Email", "Phone", "Role"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
        }

        List<User> users = new ArrayList<>();
        users = userRepository.findAll();
        // Sample data
        int rowNum = 0;
        for (User user : users) {

            Row info  = sheet.createRow(++rowNum);
            info.createCell(0).setCellValue(user.getFullName());
            info.createCell(1).setCellValue(user.getEmail());
            info.createCell(2).setCellValue(user.getPhone());

            info.createCell(3).setCellValue(user.getRole().toString());
        }
//        Row sampleRow1 = sheet.createRow(1);
//        sampleRow1.createCell(0).setCellValue("Nguyen Van A");
//        sampleRow1.createCell(1).setCellValue("vana@example.com");
//        sampleRow1.createCell(2).setCellValue("0987654321");
//        sampleRow1.createCell(3).setCellValue("Password1");
//        sampleRow1.createCell(4).setCellValue("PARENT");
//
//        Row sampleRow2 = sheet.createRow(2);
//        sampleRow2.createCell(0).setCellValue("Le Thi B");
//        sampleRow2.createCell(1).setCellValue("thib@example.com");
//        sampleRow2.createCell(2).setCellValue("0912345678");
//        sampleRow2.createCell(3).setCellValue("Password2");
//        sampleRow2.createCell(4).setCellValue("NURSE");



        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }

    public BulkImportResponse importUsersFromExcel(MultipartFile file) throws IOException {
        BulkImportResponse result = new BulkImportResponse();
        List<String> successUsers = new ArrayList<>();
        List<BulkImportResponse.ImportError> errors = new ArrayList<>();

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        int totalRecords = sheet.getLastRowNum();
        result.setTotalRecords(totalRecords);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String fullName = getCellValue(row.getCell(0));
            String email = getCellValue(row.getCell(1));
            String phone = getCellValue(row.getCell(2));
            String password = getCellValue(row.getCell(3));
            String role = getCellValue(row.getCell(4));

            // Validate required fields
            if (fullName.isEmpty() || email.isEmpty() || phone.isEmpty() || password.isEmpty() || role.isEmpty()) {
                errors.add(new BulkImportResponse.ImportError(i + 1, "general", "", "Thiếu dữ liệu bắt buộc"));
                continue;
            }

            // Check exists (the same as registerUser logic)
            if (userRepository.existsByEmail(email)) {
                errors.add(new BulkImportResponse.ImportError(i + 1, "email", email, "User with this email already exists"));
                continue;
            }
            if (userRepository.existsByPhone(phone)) {
                errors.add(new BulkImportResponse.ImportError(i + 1, "phone", phone, "User with this phone already exists"));
                continue;
            }

            try {
                User newUser = new User();
                newUser.setFullName(fullName);
                newUser.setEmail(email);
                newUser.setPhone(phone);
                newUser.setPasswordHash(passwordEncoder.encode(password));
                newUser.setRole(switch (role.toUpperCase()) {
                    case "ADMIN" -> UserRole.ADMIN;
                    case "BUSINESS_MANAGER" -> UserRole.BUSINESS_MANAGER;
                    case "TECHNICIAN" -> UserRole.TECHNICIAN;
                    case "SERVICE_ADVISOR" -> UserRole.SERVICE_ADVISOR;
                    default -> UserRole.CUSTOMER; // Default to USER if role is unknown
                });
                publisher.publishEvent(new UserRegisterEvent(newUser));
                userRepository.save(newUser);
                successUsers.add(email);
            } catch (Exception e) {
                errors.add(new BulkImportResponse.ImportError(i + 1, "general", email, "Lỗi hệ thống: " + e.getMessage()));
            }
        }

        result.setSuccessCount(successUsers.size());
        result.setErrorCount(errors.size());
        result.setSuccessUsers(successUsers);
        result.setErrors(errors);

        workbook.close();
        return result;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }
}