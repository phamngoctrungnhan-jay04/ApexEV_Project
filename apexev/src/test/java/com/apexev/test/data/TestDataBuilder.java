package com.apexev.test.data;

import com.apexev.entity.*;
import com.apexev.enums.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Test Data Builder for all ApexEV entities
 * Provides factory methods and builders for creating test data
 */
public class TestDataBuilder {

    // ==================== USER & VEHICLE ====================

    public static User createCustomer(String email, String phone) {
        User user = new User();
        user.setFullName("Nguyễn Văn Khách " + UUID.randomUUID().toString().substring(0, 5));
        user.setEmail(email != null ? email : "customer_" + UUID.randomUUID() + "@example.com");
        user.setPhone(phone != null ? phone : "0" + System.currentTimeMillis() % 9000000000L);
        user.setPasswordHash("$2a$10$hashedPassword");
        user.setRole(UserRole.CUSTOMER);
        user.setActive(true);
        return user;
    }

    public static User createServiceAdvisor(String email, String phone) {
        User user = new User();
        user.setFullName("Cố Vấn Dịch Vụ " + UUID.randomUUID().toString().substring(0, 5));
        user.setEmail(email != null ? email : "advisor_" + UUID.randomUUID() + "@example.com");
        user.setPhone(phone != null ? phone : "0" + System.currentTimeMillis() % 9000000000L);
        user.setPasswordHash("$2a$10$hashedPassword");
        user.setRole(UserRole.SERVICE_ADVISOR);
        user.setActive(true);
        return user;
    }

    public static User createTechnician(String email, String phone) {
        User user = new User();
        user.setFullName("Kỹ Thuật Viên " + UUID.randomUUID().toString().substring(0, 5));
        user.setEmail(email != null ? email : "technician_" + UUID.randomUUID() + "@example.com");
        user.setPhone(phone != null ? phone : "0" + System.currentTimeMillis() % 9000000000L);
        user.setPasswordHash("$2a$10$hashedPassword");
        user.setRole(UserRole.TECHNICIAN);
        user.setActive(true);
        return user;
    }

    public static User createBusinessManager(String email, String phone) {
        User user = new User();
        user.setFullName("Quản Lý Kinh Doanh " + UUID.randomUUID().toString().substring(0, 5));
        user.setEmail(email != null ? email : "manager_" + UUID.randomUUID() + "@example.com");
        user.setPhone(phone != null ? phone : "0" + System.currentTimeMillis() % 9000000000L);
        user.setPasswordHash("$2a$10$hashedPassword");
        user.setRole(UserRole.BUSINESS_MANAGER);
        user.setActive(true);
        return user;
    }

    public static User createAdmin(String email, String phone) {
        User user = new User();
        user.setFullName("Quản Trị Viên " + UUID.randomUUID().toString().substring(0, 5));
        user.setEmail(email != null ? email : "admin_" + UUID.randomUUID() + "@example.com");
        user.setPhone(phone != null ? phone : "0" + System.currentTimeMillis() % 9000000000L);
        user.setPasswordHash("$2a$10$hashedPassword");
        user.setRole(UserRole.ADMIN);
        user.setActive(true);
        return user;
    }

    public static StaffProfile createStaffProfile(User user) {
        StaffProfile profile = new StaffProfile();
        profile.setId(user.getUserId());
        profile.setUser(user);
        profile.setEmployeeCode("APEX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        profile.setHireDate(LocalDate.now().minusYears(2));
        profile.setAnnualLeaveBalance(12);
        profile.setSickLeaveBalance(7);
        profile.setIsActive(true);
        return profile;
    }

    public static Vehicle createVehicle(User customer) {
        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate("99A-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        vehicle.setVinNumber("WVWZZZ3CZ9E" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        vehicle.setBrand("Volkswagen");
        vehicle.setModel("ID.4");
        vehicle.setYearManufactured(2023);
        vehicle.setCustomer(customer);
        return vehicle;
    }

    // ==================== APPOINTMENT & SERVICE ORDER ====================

    public static Appointment createAppointment(User customer, Vehicle vehicle, User serviceAdvisor) {
        Appointment appointment = new Appointment();
        appointment.setRequestedService("Bảo dưỡng định kỳ, kiểm tra pin");
        appointment.setAppointmentTime(LocalDateTime.now().plusDays(7).withHour(9).withMinute(0));
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setNotes("Khách yêu cầu rửa sạch chiếc xe trước khi giao");
        appointment.setCustomer(customer);
        appointment.setVehicle(vehicle);
        appointment.setServiceAdvisor(serviceAdvisor);
        return appointment;
    }

    public static ServiceOrder createServiceOrder(User customer, Vehicle vehicle, User serviceAdvisor, User technician, Appointment appointment) {
        ServiceOrder order = new ServiceOrder();
        order.setStatus(OrderStatus.RECEPTION);
        order.setCustomerDescription("Xe cảm thấy chậm, cần kiểm tra động cơ và pin");
        order.setAdvisorNotes("Khách mang xe đến lúc 9h sáng, mong muốn giao lại trong ngày");
        order.setTechnicianNotes(null); // Will be filled later
        order.setCompletedAt(null);
        order.setAppointment(appointment);
        order.setCustomer(customer);
        order.setVehicle(vehicle);
        order.setServiceAdvisor(serviceAdvisor);
        order.setTechnician(technician);
        order.setOrderItems(new HashSet<>());
        order.setChecklists(new HashSet<>());
        return order;
    }

    public static ServiceOrder createWalkInServiceOrder(User customer, Vehicle vehicle, User serviceAdvisor, User technician) {
        return createServiceOrder(customer, vehicle, serviceAdvisor, technician, null);
    }

    // ==================== SPARE PARTS ====================

    public static Part createPart(String partName, String sku, int quantity, BigDecimal price) {
        Part part = new Part();
        part.setPartName(partName);
        part.setSku(sku != null ? sku : "SKU-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        part.setDescription("Phụ tùng chính hãng cho xe điện");
        part.setQuantityInStock(quantity);
        part.setPrice(price);
        part.setStatus(quantity > 0 ? PartStatus.ACTIVE : PartStatus.OUT_OF_STOCK);
        return part;
    }

    public static Part createBatteryPack() {
        return createPart("Pin Chính 62 kWh", "BATT-ID4-62KWH", 3, new BigDecimal("850000.00"));
    }

    public static Part createMotorController() {
        return createPart("Bộ Điều Khiển Động Cơ", "MOTOR-CTRL-VW", 5, new BigDecimal("450000.00"));
    }

    public static Part createChargingCable() {
        return createPart("Cáp Sạc DC 150kW", "CABLE-DC-150KW", 10, new BigDecimal("25000.00"));
    }

    public static Part createBrakePad() {
        return createPart("Pads Phanh Trước", "BRAKE-FRONT-ID4", 15, new BigDecimal("8500.00"));
    }

    public static Part createAirFilter() {
        return createPart("Bộ Lọc Không Khí", "FILTER-AIR-CABIN", 20, new BigDecimal("1200.00"));
    }

    // ==================== MAINTENANCE SERVICES ====================

    public static MaintenanceService createMaintenanceService(String serviceName, BigDecimal basePrice) {
        MaintenanceService service = new MaintenanceService();
        service.setServiceName(serviceName);
        service.setDescription("Dịch vụ chuyên nghiệp được thực hiện bởi các kỹ thuật viên");
        service.setBasePrice(basePrice);
        return service;
    }

    public static MaintenanceService createBatteryDiagnostic() {
        return createMaintenanceService("Chẩn Đoán Pin", new BigDecimal("500000.00"));
    }

    public static MaintenanceService createMotorMaintenance() {
        return createMaintenanceService("Bảo Dưỡng Động Cơ Điện", new BigDecimal("750000.00"));
    }

    public static MaintenanceService createBrakesService() {
        return createMaintenanceService("Bảo Dưỡng Hệ Thống Phanh", new BigDecimal("600000.00"));
    }

    public static MaintenanceService createWheelAlignment() {
        return createMaintenanceService("Cân Bằng & Chỉnh Gầm", new BigDecimal("400000.00"));
    }

    // ==================== SERVICE ORDER ITEMS ====================

    public static ServiceOrderItem createServiceOrderItem(ServiceOrder order, MaintenanceService service, int quantity) {
        ServiceOrderItem item = new ServiceOrderItem();
        item.setItemType(OrderItemType.SERVICE);
        item.setItemRefId(service.getId());
        item.setQuantity(quantity);
        item.setUnitPrice(service.getBasePrice());
        item.setStatus(OrderItemStatus.REQUESTED);
        item.setServiceOrder(order);
        return item;
    }

    public static ServiceOrderItem createServiceOrderPartItem(ServiceOrder order, Part part, int quantity) {
        ServiceOrderItem item = new ServiceOrderItem();
        item.setItemType(OrderItemType.PART);
        item.setItemRefId(part.getId());
        item.setQuantity(quantity);
        item.setUnitPrice(part.getPrice());
        item.setStatus(OrderItemStatus.REQUESTED);
        item.setServiceOrder(order);
        return item;
    }

    // ==================== INVOICE & PAYMENT ====================

    public static Invoice createInvoice(ServiceOrder order, BigDecimal totalAmount) {
        Invoice invoice = new Invoice();
        invoice.setTotalAmount(totalAmount);
        invoice.setStatus(InvoiceStatus.PENDING);
        invoice.setDueDate(LocalDateTime.now().plusDays(7));
        invoice.setServiceOrder(order);
        invoice.setPayments(new HashSet<>());
        return invoice;
    }

    public static Payment createPayment(Invoice invoice, BigDecimal amount, String paymentMethod) {
        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod); // "CASH", "CARD", "ONLINE"
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 16).toUpperCase());
        payment.setInvoice(invoice);
        return payment;
    }

    // ==================== REVIEWS ====================

    public static Review createReview(ServiceOrder order, User customer, int rating, String comment) {
        Review review = new Review();
        review.setRating(rating);
        review.setComment(comment);
        review.setServiceOrder(order);
        review.setCustomer(customer);
        return review;
    }

    public static Review createFiveStarReview(ServiceOrder order, User customer) {
        return createReview(order, customer, 5, "Dịch vụ rất tốt, chuyên nghiệp và nhanh chóng!");
    }

    public static Review createFourStarReview(ServiceOrder order, User customer) {
        return createReview(order, customer, 4, "Tốt nhưng thời gian chờ hơi lâu");
    }

    // ==================== PERFORMANCE REVIEW ====================

    public static KPI createKPI(String name, Double weight) {
        KPI kpi = new KPI();
        kpi.setName(name);
        kpi.setDescription("Tiêu chỉ đánh giá " + name.toLowerCase());
        kpi.setWeight(weight);
        kpi.setIsActive(true);
        return kpi;
    }

    public static KPI createProductivityKPI() {
        return createKPI("Năng Suất", 0.25);
    }

    public static KPI createQualityKPI() {
        return createKPI("Chất Lượng Công Việc", 0.30);
    }

    public static KPI createAttendanceKPI() {
        return createKPI("Chuyên Cần", 0.20);
    }

    public static KPI createTeamworkKPI() {
        return createKPI("Tinh Thần Đồng Đội", 0.25);
    }

    public static PerformanceReview createPerformanceReview(User staff, User reviewer) {
        PerformanceReview review = new PerformanceReview();
        review.setStaff(staff);
        review.setReviewer(reviewer);
        review.setPeriodStart(LocalDate.now().withDayOfMonth(1).minusMonths(3));
        review.setPeriodEnd(LocalDate.now().withDayOfMonth(1).minusDays(1));
        review.setStatus(ReviewStatus.DRAFT);
        review.setOverallRating(4.5);
        review.setStrengths("Chuyên môn cao, làm việc cầu thị");
        review.setWeaknesses("Đôi khi chậm trong giao tiếp");
        review.setRecommendations("Tiếp tục phát triển kỹ năng quản lý thời gian");
        review.setFeedback("Nhân viên tích cực, đáng kỳ vọng");
        review.setReviewKPIs(new HashSet<>());
        return review;
    }

    public static ReviewKPI createReviewKPI(PerformanceReview review, KPI kpi, Double score) {
        ReviewKPI reviewKpi = new ReviewKPI();
        reviewKpi.setReview(review);
        reviewKpi.setKpi(kpi);
        reviewKpi.setScore(score);
        reviewKpi.setComment("Đạt được mục tiêu đề ra");
        return reviewKpi;
    }

    // ==================== SHIFT & LEAVE ====================

    public static Shift createShift(String name, LocalDateTime startTime, LocalDateTime endTime) {
        Shift shift = new Shift();
        shift.setName(name);
        shift.setStartTime(startTime);
        shift.setEndTime(endTime);
        shift.setLocation("Chi nhánh ApexEV trung tâm");
        shift.setStatus(ShiftStatus.SCHEDULED);
        shift.setDescription("Ca làm việc thường quy");
        shift.setCreatedBy(1);
        shift.setAssignments(new HashSet<>());
        return shift;
    }

    public static Shift createMorningShift() {
        LocalDateTime now = LocalDateTime.now();
        return createShift("Ca Sáng", 
            now.withHour(7).withMinute(0).withSecond(0), 
            now.withHour(12).withMinute(0).withSecond(0));
    }

    public static Shift createAfternoonShift() {
        LocalDateTime now = LocalDateTime.now();
        return createShift("Ca Chiều", 
            now.withHour(12).withMinute(30).withSecond(0), 
            now.withHour(17).withMinute(30).withSecond(0));
    }

    public static Shift createEveningShift() {
        LocalDateTime now = LocalDateTime.now();
        return createShift("Ca Tối", 
            now.withHour(18).withMinute(0).withSecond(0), 
            now.withHour(22).withMinute(0).withSecond(0));
    }

    public static ShiftAssignment createShiftAssignment(Shift shift, User staff) {
        ShiftAssignment assignment = new ShiftAssignment();
        assignment.setShift(shift);
        assignment.setStaff(staff);
        assignment.setStatus(ShiftStatus.SCHEDULED);
        assignment.setNotes("Xếp ca thường quy");
        assignment.setAssignedBy(1);
        return assignment;
    }

    public static LeaveType createLeaveType(String code, String name, Boolean isPaid) {
        LeaveType leaveType = new LeaveType();
        leaveType.setCode(code);
        leaveType.setName(name);
        leaveType.setIsPaid(isPaid);
        leaveType.setAccrualRate(1.0);
        leaveType.setMaxDaysPerYear(code.equals("ANNUAL") ? 12 : 7);
        leaveType.setRequiresDocument(code.equals("SICK"));
        leaveType.setIsActive(true);
        return leaveType;
    }

    public static LeaveType createAnnualLeaveType() {
        return createLeaveType("ANNUAL", "Phép Năm", true);
    }

    public static LeaveType createSickLeaveType() {
        return createLeaveType("SICK", "Nghỉ Ốm", true);
    }

    public static LeaveType createUnpaidLeaveType() {
        return createLeaveType("UNPAID", "Nghỉ Không Lương", false);
    }

    public static LeaveRequest createLeaveRequest(User staff, LeaveType leaveType, LocalDate startDate, LocalDate endDate) {
        LeaveRequest request = new LeaveRequest();
        request.setStaff(staff);
        request.setLeaveType(leaveType);
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setTotalDays((int) (endDate.getDayOfYear() - startDate.getDayOfYear()) + 1);
        request.setStatus(LeaveStatus.PENDING);
        request.setReason("Có việc riêng cần xử lý");
        request.setDocumentUrl(null);
        return request;
    }

    // ==================== CHAT ====================

    public static ChatConversation createChatConversation(User customer, User serviceAdvisor) {
        ChatConversation conversation = new ChatConversation();
        conversation.setStatus(ChatStatus.OPEN);
        conversation.setCustomer(customer);
        conversation.setServiceAdvisor(serviceAdvisor);
        conversation.setMessages(new HashSet<>());
        return conversation;
    }

    public static ChatMessage createChatMessage(ChatConversation conversation, User sender, String messageText) {
        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setMessageText(messageText);
        return message;
    }

    // ==================== CHECKLISTS ====================

    public static ChecklistTemplate createChecklistTemplate(String templateName) {
        ChecklistTemplate template = new ChecklistTemplate();
        template.setTemplateName(templateName);
        template.setDescription("Mẫu kiểm tra cho " + templateName.toLowerCase());
        template.setItems(new HashSet<>());
        return template;
    }

    public static ChecklistTemplate createBatteryChecklistTemplate() {
        return createChecklistTemplate("Kiểm Tra Pin Toàn Bộ");
    }

    public static ChecklistTemplate createMotorChecklistTemplate() {
        return createChecklistTemplate("Kiểm Tra Động Cơ Điện");
    }

    public static ChecklistTemplateItem createChecklistTemplateItem(ChecklistTemplate template, String itemName) {
        ChecklistTemplateItem item = new ChecklistTemplateItem();
        item.setItemName(itemName);
        item.setItemDescription("Mục kiểm tra: " + itemName.toLowerCase());
        item.setTemplate(template);
        return item;
    }

    public static ServiceChecklist createServiceChecklist(ServiceOrder order, ChecklistTemplate template, User technician) {
        ServiceChecklist checklist = new ServiceChecklist();
        checklist.setServiceOrder(order);
        checklist.setTemplate(template);
        checklist.setTechnician(technician);
        checklist.setResults(new HashSet<>());
        return checklist;
    }

    public static ServiceChecklistResult createChecklistResult(ServiceChecklist checklist, ChecklistTemplateItem templateItem, ChecklistItemStatus status) {
        ServiceChecklistResult result = new ServiceChecklistResult();
        result.setServiceChecklist(checklist);
        result.setTemplateItem(templateItem);
        result.setStatus(status);
        result.setTechnicianNotes(status == ChecklistItemStatus.PASSED ? "Hoạt động bình thường" : "Cần sửa chữa");
        return result;
    }

    // ==================== NOTIFICATIONS ====================

    public static Notification createNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);
        return notification;
    }

    public static NotificationTemplate createNotificationTemplate(String key, String subject, String body) {
        NotificationTemplate template = new NotificationTemplate();
        template.setTemplateKey(key);
        template.setSubject(subject);
        template.setBody(body);
        return template;
    }

    public static NotificationTemplate createOrderReadyTemplate() {
        return createNotificationTemplate(
            "ORDER_READY",
            "Xe của bạn đã sẵn sàng",
            "Xin chào {{customerName}}, chiếc {{vehicleModel}} của bạn đã sửa chữa xong. Vui lòng đến chi nhánh để nhận xe."
        );
    }

    // ==================== TECHNICAL DOCUMENTS ====================

    public static TechnicalDocument createTechnicalDocument(String title, String category, User uploadedBy) {
        TechnicalDocument doc = new TechnicalDocument();
        doc.setTitle(title);
        doc.setDescription("Tài liệu kỹ thuật: " + title.toLowerCase());
        doc.setFileUrl("https://documents.apexev.com/" + UUID.randomUUID().toString() + ".pdf");
        doc.setCategory(category);
        doc.setUploadedBy(uploadedBy);
        return doc;
    }

    public static TechnicalDocument createBatteryMaintenanceGuide(User admin) {
        return createTechnicalDocument("Hướng Dẫn Bảo Dưỡng Pin", "MAINTENANCE", admin);
    }

    // ==================== COMPREHENSIVE TEST SCENARIOS ====================

    /**
     * Create a complete business scenario with all related entities
     */
    public static Map<String, Object> createCompleteBusinessScenario() {
        Map<String, Object> scenario = new HashMap<>();

        // Users
        User customer = createCustomer("customer@example.com", "0912345678");
        User advisor = createServiceAdvisor("advisor@example.com", "0987654321");
        User technician = createTechnician("tech@example.com", "0989999999");
        User manager = createBusinessManager("manager@example.com", "0988888888");
        User admin = createAdmin("admin@example.com", "0977777777");

        scenario.put("customer", customer);
        scenario.put("advisor", advisor);
        scenario.put("technician", technician);
        scenario.put("manager", manager);
        scenario.put("admin", admin);

        // Staff Profiles
        StaffProfile advisorProfile = createStaffProfile(advisor);
        StaffProfile technicianProfile = createStaffProfile(technician);

        scenario.put("advisorProfile", advisorProfile);
        scenario.put("technicianProfile", technicianProfile);

        // Vehicle
        Vehicle vehicle = createVehicle(customer);
        scenario.put("vehicle", vehicle);

        // Appointment
        Appointment appointment = createAppointment(customer, vehicle, advisor);
        scenario.put("appointment", appointment);

        // Service Order
        ServiceOrder order = createServiceOrder(customer, vehicle, advisor, technician, appointment);
        scenario.put("serviceOrder", order);

        // Parts
        Part battery = createBatteryPack();
        Part controller = createMotorController();
        Part cable = createChargingCable();

        scenario.put("batteryPart", battery);
        scenario.put("controllerPart", controller);
        scenario.put("cablePart", cable);

        // Services
        MaintenanceService batteryDiag = createBatteryDiagnostic();
        MaintenanceService motorMaint = createMotorMaintenance();

        scenario.put("batteryDiagnostic", batteryDiag);
        scenario.put("motorMaintenance", motorMaint);

        // Service Order Items
        ServiceOrderItem item1 = createServiceOrderItem(order, batteryDiag, 1);
        ServiceOrderItem item2 = createServiceOrderPartItem(order, battery, 1);
        order.getOrderItems().add(item1);
        order.getOrderItems().add(item2);

        scenario.put("serviceItem1", item1);
        scenario.put("serviceItem2", item2);

        // Invoice & Payments
        BigDecimal totalAmount = batteryDiag.getBasePrice().add(battery.getPrice());
        Invoice invoice = createInvoice(order, totalAmount);
        Payment payment = createPayment(invoice, totalAmount, "CARD");
        invoice.getPayments().add(payment);

        scenario.put("invoice", invoice);
        scenario.put("payment", payment);

        // Review
        Review review = createFiveStarReview(order, customer);
        scenario.put("review", review);

        // Shifts
        Shift morningShift = createMorningShift();
        ShiftAssignment techAssignment = createShiftAssignment(morningShift, technician);
        morningShift.getAssignments().add(techAssignment);

        scenario.put("shift", morningShift);
        scenario.put("shiftAssignment", techAssignment);

        // Checklists
        ChecklistTemplate batteryTemplate = createBatteryChecklistTemplate();
        ChecklistTemplateItem item = createChecklistTemplateItem(batteryTemplate, "Kiểm Tra Điện Áp");
        batteryTemplate.getItems().add(item);

        ServiceChecklist checklist = createServiceChecklist(order, batteryTemplate, technician);
        ServiceChecklistResult result = createChecklistResult(checklist, item, ChecklistItemStatus.PASSED);
        checklist.getResults().add(result);

        scenario.put("checklistTemplate", batteryTemplate);
        scenario.put("serviceChecklist", checklist);
        scenario.put("checklistResult", result);

        // Chat
        ChatConversation chat = createChatConversation(customer, advisor);
        ChatMessage message1 = createChatMessage(chat, customer, "Xe của em bị sao vậy anh?");
        ChatMessage message2 = createChatMessage(chat, advisor, "Dạ, cần kiểm tra pin chứ em ơi");
        chat.getMessages().add(message1);
        chat.getMessages().add(message2);

        scenario.put("chatConversation", chat);
        scenario.put("chatMessage1", message1);
        scenario.put("chatMessage2", message2);

        // Notifications
        Notification notif = createNotification(customer, "Xe của bạn đã sửa xong, vui lòng ghé lấy");
        scenario.put("notification", notif);

        // Performance Review
        KPI kpi1 = createProductivityKPI();
        KPI kpi2 = createQualityKPI();
        PerformanceReview perfReview = createPerformanceReview(technician, manager);
        ReviewKPI reviewKpi1 = createReviewKPI(perfReview, kpi1, 4.5);
        ReviewKPI reviewKpi2 = createReviewKPI(perfReview, kpi2, 4.8);
        perfReview.getReviewKPIs().add(reviewKpi1);
        perfReview.getReviewKPIs().add(reviewKpi2);

        scenario.put("performanceReview", perfReview);
        scenario.put("kpi1", kpi1);
        scenario.put("kpi2", kpi2);
        scenario.put("reviewKpi1", reviewKpi1);
        scenario.put("reviewKpi2", reviewKpi2);

        // Leave
        LeaveType annualLeave = createAnnualLeaveType();
        LeaveRequest leaveReq = createLeaveRequest(technician, annualLeave, 
            LocalDate.now().plusDays(7), LocalDate.now().plusDays(9));

        scenario.put("leaveType", annualLeave);
        scenario.put("leaveRequest", leaveReq);

        // Technical Documents
        TechnicalDocument doc = createBatteryMaintenanceGuide(admin);
        scenario.put("technicalDocument", doc);

        // Notification Template
        NotificationTemplate notifTemplate = createOrderReadyTemplate();
        scenario.put("notificationTemplate", notifTemplate);

        return scenario;
    }

    /**
     * Verify all entities are properly created
     */
    public static void printScenarioSummary(Map<String, Object> scenario) {
        System.out.println("=== TEST DATA SCENARIO SUMMARY ===");
        System.out.println("Total entities created: " + scenario.size());
        System.out.println("\nEntity breakdown:");
        scenario.forEach((key, value) -> {
            System.out.printf("  %-30s: %s%n", key, value.getClass().getSimpleName());
        });
    }
}
